#include "xprof/convert/trace_viewer/prefix_trie.h"

#include <cstddef>
#include <map>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include "absl/log/check.h"
#include "absl/status/status.h"
#include "absl/strings/str_cat.h"
#include "xla/tsl/lib/io/table_builder.h"
#include "xla/tsl/lib/io/table_options.h"
#include "xla/tsl/platform/env.h"
#include "xla/tsl/platform/file_system.h"
#include "plugin/xprof/protobuf/prefix_trie_node.pb.h"

namespace {

using ::tensorflow::profiler::LoadTrieAsLevelDbTableAndSearch;
using ::tensorflow::profiler::PrefixSearchResult;
using ::tensorflow::profiler::PrefixTrie;
using ::tensorflow::profiler::PrefixTrieNodeProto;
using ::testing::FieldsAre;
using ::testing::IsEmpty;
using ::testing::UnorderedElementsAreArray;
using ::testing::UnorderedPointwise;

std::string GetTempFilename() {
  return absl::StrCat(::testing::TempDir(), "/prefix_trie.ptldb2");
}

// Custom matcher to compare PrefixSearchResult structs.
MATCHER(PrefixSearchResultFieldsAreEqual, "") {
  const PrefixSearchResult& a = std::get<0>(arg);
  const PrefixSearchResult& b = std::get<1>(arg);
  return ExplainMatchResult(
      FieldsAre(b.key, UnorderedElementsAreArray(b.terminal_key_ids)), a,
      result_listener);
}

TEST(PrefixTrieTest, PrefixSearchOnEmptyTrie) {
  PrefixTrie trie;

  std::unique_ptr<tsl::WritableFile> file;
  ASSERT_OK(tsl::Env::Default()->NewWritableFile(GetTempFilename(), &file));
  ASSERT_OK(trie.SaveAsLevelDbTable(file.get()));

  auto results = LoadTrieAsLevelDbTableAndSearch(GetTempFilename(), "a");
  ASSERT_OK(results);
  EXPECT_THAT(*results, IsEmpty());
}

TEST(PrefixTrieTest, PrefixSearchOnTrieWithSingleKey) {
  PrefixTrie trie;
  trie.Insert("abc", "id00");

  std::unique_ptr<tsl::WritableFile> file;
  ASSERT_OK(tsl::Env::Default()->NewWritableFile(GetTempFilename(), &file));
  ASSERT_OK(trie.SaveAsLevelDbTable(file.get()));

  auto results = LoadTrieAsLevelDbTableAndSearch(GetTempFilename(), "a");
  ASSERT_OK(results);
  std::vector<PrefixSearchResult> expected_results = {
      {.key = "abc", .terminal_key_ids = {"id00"}}};
  EXPECT_THAT(*results, UnorderedPointwise(PrefixSearchResultFieldsAreEqual(),
                                           expected_results));
}

class PrefixTrieWithDataTest : public ::testing::Test {
 protected:
  void SetUp() override {
    filename_ = GetTempFilename();
    PrefixTrie trie;
    trie.Insert("abc", "id00");
    trie.Insert("abcd", "id01");
    trie.Insert("abce", "id02");
    trie.Insert("a", "id03");
    trie.Insert("abcd", "id04");
    trie.Insert("def", "id05");

    std::unique_ptr<tsl::WritableFile> file;
    ASSERT_OK(tsl::Env::Default()->NewWritableFile(filename_, &file));
    ASSERT_OK(trie.SaveAsLevelDbTable(file.get()));
  }

  std::string filename_;
};

TEST_F(PrefixTrieWithDataTest,
       PrefixSearchOnTrieWithMultipleKeysMatchingPrefix) {
  auto results = LoadTrieAsLevelDbTableAndSearch(filename_, "abc");
  ASSERT_OK(results);
  std::vector<PrefixSearchResult> expected_results = {
      {.key = "abc", .terminal_key_ids = {"id00"}},
      {.key = "abcd", .terminal_key_ids = {"id01", "id04"}},
      {.key = "abce", .terminal_key_ids = {"id02"}}};
  EXPECT_THAT(*results, UnorderedPointwise(PrefixSearchResultFieldsAreEqual(),
                                           expected_results));
}

TEST_F(PrefixTrieWithDataTest,
       PrefixSearchOnTrieWithMultipleKeysPrefixNotFound) {
  auto results = LoadTrieAsLevelDbTableAndSearch(filename_, "abd");
  ASSERT_OK(results);
  EXPECT_THAT(*results, IsEmpty());
}

TEST_F(PrefixTrieWithDataTest, PrefixSearchOnTrieWithMultipleKeysEmptyPrefix) {
  auto results = LoadTrieAsLevelDbTableAndSearch(filename_, "");
  ASSERT_OK(results);
  std::vector<PrefixSearchResult> expected_results = {
      {.key = "abc", .terminal_key_ids = {"id00"}},
      {.key = "abcd", .terminal_key_ids = {"id01", "id04"}},
      {.key = "abce", .terminal_key_ids = {"id02"}},
      {.key = "a", .terminal_key_ids = {"id03"}},
      {.key = "def", .terminal_key_ids = {"id05"}}};
  EXPECT_THAT(*results, UnorderedPointwise(PrefixSearchResultFieldsAreEqual(),
                                           expected_results));
}

TEST_F(PrefixTrieWithDataTest,
       PrefixSearchOnTrieWithMultipleKeysPrefixIsAnExactMatch) {
  auto results = LoadTrieAsLevelDbTableAndSearch(filename_, "abce");
  ASSERT_OK(results);
  std::vector<PrefixSearchResult> expected_results = {
      {.key = "abce", .terminal_key_ids = {"id02"}}};
  EXPECT_THAT(*results, UnorderedPointwise(PrefixSearchResultFieldsAreEqual(),
                                           expected_results));
}

TEST(PrefixTrieTest, PrefixTrieSearchWithFileNotFound) {
  auto results =
      LoadTrieAsLevelDbTableAndSearch("non_existent_file.ptldb2", "a");
  EXPECT_EQ(results.status().code(), absl::StatusCode::kNotFound);
}

// Builds the table the trie is expected to write: one entry per trie node
// (every prefix of every inserted key, including the empty root key), in
// lexicographic key order, whose value is a serialized PrefixTrieNodeProto
// holding the node's ids in insertion order.
std::string ExpectedTableContents(
    const std::vector<std::pair<std::string, std::string>>& insertions) {
  std::map<std::string, PrefixTrieNodeProto> nodes;
  nodes[""];
  for (const auto& [key, id] : insertions) {
    for (size_t len = 1; len <= key.size(); ++len) nodes[key.substr(0, len)];
    nodes[key].add_terminal_key_ids(id);
  }
  const std::string filename =
      absl::StrCat(::testing::TempDir(), "/expected_prefix_trie.ptldb2");
  std::unique_ptr<tsl::WritableFile> file;
  CHECK_OK(tsl::Env::Default()->NewWritableFile(filename, &file));
  // Same options as PrefixTrie::SaveAsLevelDbTable.
  tsl::table::Options options;
  options.block_size = 20 * 1024 * 1024;
  options.compression = tsl::table::kSnappyCompression;
  tsl::table::TableBuilder builder(options, file.get());
  for (const auto& [key, proto] : nodes) {
    builder.Add(key, proto.SerializeAsString());
  }
  CHECK_OK(builder.Finish());
  CHECK_OK(file->Close());
  std::string contents;
  CHECK_OK(tsl::ReadFileToString(tsl::Env::Default(), filename, &contents));
  return contents;
}

std::string SavedTableContents(
    const std::vector<std::pair<std::string, std::string>>& insertions) {
  PrefixTrie trie;
  for (const auto& [key, id] : insertions) trie.Insert(key, id);
  const std::string filename = GetTempFilename();
  std::unique_ptr<tsl::WritableFile> file;
  CHECK_OK(tsl::Env::Default()->NewWritableFile(filename, &file));
  CHECK_OK(trie.SaveAsLevelDbTable(file.get()));
  std::string contents;
  CHECK_OK(tsl::ReadFileToString(tsl::Env::Default(), filename, &contents));
  return contents;
}

TEST(PrefixTrieTest, SavedTableIsByteIdenticalToReferenceTable) {
  const std::string long_id(300, 'x');  // Needs a multi-byte varint length.
  const std::vector<std::pair<std::string, std::string>> insertions = {
      {"fusion.1", std::string("\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09", 10)},
      {"fusion.12", "id-b"},
      {"fusion.1", "id-c"},
      {"convolution", "id-d"},
      {"", "id-at-root"},
      {"f", ""},  // Empty id.
      {"copy-start", long_id},
      {"fusion.1", "id-e"},
  };
  EXPECT_EQ(SavedTableContents(insertions), ExpectedTableContents(insertions));
}

TEST(PrefixTrieTest, SavedEmptyTrieIsByteIdenticalToReferenceTable) {
  EXPECT_EQ(SavedTableContents({}), ExpectedTableContents({}));
}

}  // namespace
