#include "xprof/convert/trace_viewer/prefix_trie.h"

#include <cstddef>
#include <cstdint>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "absl/container/btree_map.h"
#include "absl/log/check.h"
#include "absl/log/log.h"
#include "absl/status/status.h"
#include "absl/status/statusor.h"
#include "absl/strings/match.h"
#include "absl/strings/str_cat.h"
#include "absl/strings/string_view.h"
#include "absl/time/clock.h"
#include "absl/time/time.h"
#include "xla/tsl/lib/io/iterator.h"
#include "xla/tsl/lib/io/table.h"
#include "xla/tsl/lib/io/table_builder.h"
#include "xla/tsl/lib/io/table_options.h"
#include "xla/tsl/platform/env.h"
#include "xla/tsl/platform/errors.h"
#include "xla/tsl/platform/file_system.h"
#include "plugin/xprof/protobuf/prefix_trie_node.pb.h"

namespace tensorflow {
namespace profiler {

namespace {

// Field 1 (terminal_key_ids) of PrefixTrieNodeProto, wire type 2
// (length-delimited): (1 << 3) | 2.
constexpr char kTerminalKeyIdsTag = 0x0A;

void AppendVarint(uint64_t value, std::string* out) {
  while (value >= 0x80) {
    out->push_back(static_cast<char>(value | 0x80));
    value >>= 7;
  }
  out->push_back(static_cast<char>(value));
}

// Reads a varint starting at `*pos` in `data` and advances `*pos` past it.
uint64_t ReadVarint(absl::string_view data, size_t* pos) {
  uint64_t value = 0;
  for (int shift = 0;; shift += 7) {
    const uint8_t byte = static_cast<uint8_t>(data[(*pos)++]);
    value |= static_cast<uint64_t>(byte & 0x7F) << shift;
    if ((byte & 0x80) == 0) return value;
  }
}

}  // namespace

PrefixTrieNode::~PrefixTrieNode() {
  std::vector<std::unique_ptr<PrefixTrieNode>> children_to_delete;
  auto delete_children =
      [&children_to_delete](
          absl::btree_map<char, std::unique_ptr<PrefixTrieNode>>& children) {
        for (auto& [_, child] : children) {
          if (child != nullptr) {
            children_to_delete.push_back(std::move(child));
          }
        }
      };

  delete_children(this->children);
  children.clear();

  while (!children_to_delete.empty()) {
    std::unique_ptr<PrefixTrieNode> current =
        std::move(children_to_delete.back());
    children_to_delete.pop_back();
    delete_children(current->children);
  }
}

void PrefixTrieNode::AddTerminalKeyId(absl::string_view id) {
  AppendVarint(id.size(), &packed_terminal_key_ids);
  packed_terminal_key_ids.append(id);
}

void PrefixTrieNode::AppendSerializedProto(std::string* out) const {
  // Each packed entry is [varint length][bytes], which is exactly the payload
  // of one length-delimited field, so the wire format of the proto is each
  // entry preceded by the field tag.
  const absl::string_view packed = packed_terminal_key_ids;
  size_t pos = 0;
  while (pos < packed.size()) {
    const size_t entry_start = pos;
    const uint64_t length = ReadVarint(packed, &pos);
    pos += length;
    out->push_back(kTerminalKeyIdsTag);
    out->append(packed.substr(entry_start, pos - entry_start));
  }
}

void PrefixTrie::Insert(absl::string_view key, absl::string_view id) {
  DCHECK(!saved_) << "PrefixTrie::Insert called after SaveAsLevelDbTable.";
  PrefixTrieNode* node = &root_;
  for (const char c : key) {
    auto& child = node->children[c];
    if (child == nullptr) {
      child = std::make_unique<PrefixTrieNode>();
    }
    node = child.get();
  }
  node->AddTerminalKeyId(id);
}

void IterateTrieAndSaveToLevelDbTable(PrefixTrieNode* node, std::string key,
                                      tsl::table::TableBuilder& builder) {
  std::vector<std::pair<PrefixTrieNode*, std::string>> stack;
  stack.push_back({node, std::move(key)});
  std::string value;

  while (!stack.empty()) {
    auto [node, key] = std::move(stack.back());
    stack.pop_back();

    value.clear();
    node->AppendSerializedProto(&value);
    builder.Add(key, value);
    // The ids are no longer needed once written; free them right away so the
    // trie shrinks while it is being saved.
    std::string().swap(node->packed_terminal_key_ids);
    for (auto it = node->children.rbegin(); it != node->children.rend(); ++it) {
      stack.push_back(
          {it->second.get(), absl::StrCat(key, std::string(1, it->first))});
    }
  }
}

absl::Status PrefixTrie::SaveAsLevelDbTable(tsl::WritableFile* file) {
  DCHECK(!saved_) << "PrefixTrie::SaveAsLevelDbTable called twice.";
  saved_ = true;
  tsl::table::Options options;
  options.block_size = 20 * 1024 * 1024;
  options.compression = tsl::table::kSnappyCompression;
  tsl::table::TableBuilder builder(options, file);
  IterateTrieAndSaveToLevelDbTable(&root_, "", builder);
  TF_RETURN_IF_ERROR(builder.Finish());
  absl::string_view filename;
  TF_RETURN_IF_ERROR(file->Name(&filename));
  TF_RETURN_WITH_CONTEXT_IF_ERROR(
      file->Close(), "Failed to save prefix trie to file: ", filename);
  return absl::OkStatus();
}

absl::StatusOr<std::vector<PrefixSearchResult>> LoadTrieAsLevelDbTableAndSearch(
    absl::string_view filename, absl::string_view prefix) {
  std::vector<PrefixSearchResult> results;
  uint64_t file_size;
  TF_RETURN_IF_ERROR(
      tsl::Env::Default()->GetFileSize(std::string(filename), &file_size));

  tsl::FileSystem* file_system;
  TF_RETURN_IF_ERROR(tsl::Env::Default()->GetFileSystemForFile(
      std::string(filename), &file_system));

  std::unique_ptr<tsl::RandomAccessFile> random_access_file;
  TF_RETURN_IF_ERROR(file_system->NewRandomAccessFile(std::string(filename),
                                                      &random_access_file));

  tsl::table::Options options;
  options.block_size = 20 * 1024 * 1024;
  tsl::table::Table* table = nullptr;
  TF_RETURN_IF_ERROR(tsl::table::Table::Open(options, random_access_file.get(),
                                             file_size, &table));
  std::unique_ptr<tsl::table::Table> table_deleter(table);
  std::unique_ptr<tsl::table::Iterator> iterator(table->NewIterator());

  iterator->Seek(prefix);
  while (iterator->Valid()) {
    std::string key = std::string(iterator->key());
    if (absl::StartsWith(key, prefix)) {
      PrefixTrieNodeProto proto;
      if (!proto.ParseFromString(iterator->value())) {
        return absl::InternalError("Failed to parse PrefixTrieNodeProto");
      }
      if (!proto.terminal_key_ids().empty()) {
        results.push_back({.key = key,
                           .terminal_key_ids = std::vector<std::string>(
                               proto.terminal_key_ids().begin(),
                               proto.terminal_key_ids().end())});
      }
      iterator->Next();
    } else {
      break;
    }
  }

  return results;
}

}  // namespace profiler
}  // namespace tensorflow
