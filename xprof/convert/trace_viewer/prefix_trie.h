#ifndef THIRD_PARTY_XPROF_CONVERT_TRACE_VIEWER_PREFIX_TRIE_H_
#define THIRD_PARTY_XPROF_CONVERT_TRACE_VIEWER_PREFIX_TRIE_H_

#include <memory>
#include <string>
#include <vector>

#include "absl/container/btree_map.h"
#include "absl/status/status.h"
#include "absl/status/statusor.h"
#include "absl/strings/string_view.h"
#include "xla/tsl/platform/file_system.h"

namespace tensorflow {
namespace profiler {

// A node in the prefix trie data structure.
struct PrefixTrieNode {
  PrefixTrieNode() = default;
  ~PrefixTrieNode();

  // Adds the id of a key that terminates at this node.
  void AddTerminalKeyId(absl::string_view id);

  // Appends this node's ids to `out` as a serialized PrefixTrieNodeProto
  // (bytes identical to PrefixTrieNodeProto::SerializeAsString()), without
  // building the proto. Currently, the proto contains just the terminal key ids
  // field which can later be extended to include other fields like children if
  // there is a need to load the whole trie into memory for caching.
  void AppendSerializedProto(std::string* out) const;

  // The ids of the keys that are terminated at this node, in insertion order.
  // Each id is stored as [varint length][id bytes]. This avoids a std::string
  // (and vector slack) per id, which dominates memory for traces with tens of
  // millions of events.
  std::string packed_terminal_key_ids;
  absl::btree_map<char, std::unique_ptr<PrefixTrieNode>> children;
};

// The result of a prefix search.
struct PrefixSearchResult {
  std::string key;
  std::vector<std::string> terminal_key_ids;
};

// Loads the provided leveldb table and finds all keys with the given prefix. It
// returns the key and the terminal key ids of all the satisfying keys.
absl::StatusOr<std::vector<PrefixSearchResult>> LoadTrieAsLevelDbTableAndSearch(
    absl::string_view filename, absl::string_view prefix);

// Manages a prefix trie data structure. The trie is built in memory and once
// built, it is saved as a leveldb table. The leveldb table can then be loaded
// and used to find all terminating key ids with a given prefix.
class PrefixTrie {
 public:
  // Inserts a key into the trie. The id is stored as a terminal key id at the
  // leaf node of the key. Must not be called after SaveAsLevelDbTable().
  void Insert(absl::string_view key, absl::string_view id);

  // Saves the trie as a leveldb table where each node's key becomes a LevelDB
  // table key and the value is the serialized terminal key ids. This format is
  // optimized for prefix searches using LevelDB's iterator. The whole trie
  // node is not stored currently, but can be added later if there is a need to
  // load the whole trie into memory for caching.
  //
  // To reduce peak memory, each node's ids are released as soon as the node is
  // written, so the trie can be saved only once.
  absl::Status SaveAsLevelDbTable(tsl::WritableFile* file);

 private:
  PrefixTrieNode root_;
  bool saved_ = false;
};

}  // namespace profiler
}  // namespace tensorflow

#endif  // THIRD_PARTY_XPROF_CONVERT_TRACE_VIEWER_PREFIX_TRIE_H_
