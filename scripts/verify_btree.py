from __future__ import annotations
from bisect import bisect_left


class BTreeNode:
    def __init__(self, leaf=True):
        self.leaf = leaf
        self.keys: list[int] = []
        self.children: list[BTreeNode] = []


class BTree:
    # Slide 13 — khởi tạo và tìm kiếm
    def __init__(self, M: int):
        if M < 3:
            raise ValueError("M phải từ 3 trở lên")
        self.M = M
        self.max_keys = M - 1
        self.min_children = (M + 1) // 2
        self.min_keys = self.min_children - 1
        self.root = BTreeNode()

    def search(self, key: int, node=None):
        if node is None:
            node = self.root
        i = bisect_left(node.keys, key)
        if i < len(node.keys) and node.keys[i] == key:
            return node, i
        if node.leaf:
            return None
        return self.search(key, node.children[i])

    # Slide 14 — chèn từ lá rồi trả kết quả tách lên cha
    def insert(self, key: int) -> bool:
        if self.search(key) is not None:
            return False
        split = self._insert(self.root, key)
        if split is not None:
            middle, right = split
            root = BTreeNode(leaf=False)
            root.keys = [middle]
            root.children = [self.root, right]
            self.root = root
        return True

    def _insert(self, node, key):
        i = bisect_left(node.keys, key)
        if node.leaf:
            node.keys.insert(i, key)
        else:
            split = self._insert(node.children[i], key)
            if split is None:
                return None
            middle, right = split
            node.keys.insert(i, middle)
            node.children.insert(i + 1, right)
        if len(node.keys) <= self.max_keys:
            return None
        mid = len(node.keys) // 2
        middle = node.keys[mid]
        right = BTreeNode(leaf=node.leaf)
        right.keys = node.keys[mid + 1:]
        node.keys = node.keys[:mid]
        if not node.leaf:
            right.children = node.children[mid + 1:]
            node.children = node.children[:mid + 1]
        return middle, right

    # Slide 15 — xóa, tìm tiền nhiệm và kiểm tra gốc
    def delete(self, key: int) -> bool:
        deleted = self._delete(self.root, key)
        if not self.root.keys and not self.root.leaf:
            self.root = self.root.children[0]
        return deleted

    def _delete(self, node, key):
        i = bisect_left(node.keys, key)
        found = i < len(node.keys) and node.keys[i] == key
        if node.leaf:
            if found:
                node.keys.pop(i)
            return found
        if found:
            predecessor = node.children[i]
            while not predecessor.leaf:
                predecessor = predecessor.children[-1]
            key = predecessor.keys[-1]
            node.keys[i] = key
        deleted = self._delete(node.children[i], key)
        if deleted and len(node.children[i].keys) < self.min_keys:
            self._fix_underflow(node, i)
        return deleted

    # Slide 16 — mượn trái, mượn phải, rồi mới xét gộp
    def _fix_underflow(self, parent, i):
        child = parent.children[i]
        left = parent.children[i - 1] if i > 0 else None
        right = parent.children[i + 1] if i + 1 < len(parent.children) else None
        if left is not None and len(left.keys) > self.min_keys:
            child.keys.insert(0, parent.keys[i - 1])
            parent.keys[i - 1] = left.keys.pop()
            if not child.leaf:
                child.children.insert(0, left.children.pop())
            return
        if right is not None and len(right.keys) > self.min_keys:
            child.keys.append(parent.keys[i])
            parent.keys[i] = right.keys.pop(0)
            if not child.leaf:
                child.children.append(right.children.pop(0))
            return
        if right is None:
            i -= 1
        left, right = parent.children[i:i + 2]
        left.keys.append(parent.keys.pop(i))
        left.keys.extend(right.keys)
        if not left.leaf:
            left.children.extend(right.children)
        parent.children.pop(i + 1)


def make_node(keys: list[int], children: list[BTreeNode] | None = None) -> BTreeNode:
    n = BTreeNode(leaf=children is None)
    n.keys = list(keys)
    if children is not None:
        n.children = children
    return n


def verify_invariants(tree: BTree) -> None:
    leaf_depths: set[int] = set()

    def dfs(node: BTreeNode, depth: int, is_root: bool, low: int | None, high: int | None) -> None:
        assert node.keys == sorted(node.keys) and len(set(node.keys)) == len(node.keys)
        assert len(node.keys) <= tree.max_keys
        if not is_root:
            assert len(node.keys) >= tree.min_keys
        for k in node.keys:
            if low is not None:
                assert k > low
            if high is not None:
                assert k < high
        if node.leaf:
            assert len(node.children) == 0
            leaf_depths.add(depth)
        else:
            assert len(node.children) == len(node.keys) + 1
            if is_root:
                assert len(node.children) >= 2
            else:
                assert len(node.children) >= tree.min_children
            for idx, child in enumerate(node.children):
                lo = low if idx == 0 else node.keys[idx - 1]
                hi = high if idx == len(node.keys) else node.keys[idx]
                dfs(child, depth + 1, False, lo, hi)

    dfs(tree.root, 0, True, None, None)
    assert len(leaf_depths) == 1


def run_tests() -> None:
    # 1. Slide 03 / Slide 06: search(17) -> found, search(16) -> None, insert(17) -> False, delete(99) -> False
    t = BTree(3)
    t.root = make_node([10], [
        make_node([5], [make_node([1, 3]), make_node([6, 8])]),
        make_node([20], [make_node([12, 17]), make_node([25, 30])]),
    ])
    verify_invariants(t)
    res = t.search(17)
    assert res is not None and res[0].keys == [12, 17] and res[1] == 1
    assert t.search(16) is None
    assert t.insert(17) is False
    assert t.delete(99) is False

    # 2. Slide 07: M=4, [10, 30] -> insert(20) -> [10, 20, 30] -> insert(25) -> root [25], leaves [10, 20], [30]
    t7 = BTree(4)
    t7.root = make_node([10, 30])
    assert t7.insert(20) is True
    assert t7.root.keys == [10, 20, 30]
    assert t7.insert(25) is True
    assert t7.root.keys == [25]
    assert [c.keys for c in t7.root.children] == [[10, 20], [30]]
    verify_invariants(t7)

    # 3. Slide 08: M=4, cascading split insert(72)
    t8 = BTree(4)
    t8.root = make_node([30, 50, 75], [
        make_node([10, 20]),
        make_node([40]),
        make_node([52, 60, 65]),
        make_node([80, 91]),
    ])
    verify_invariants(t8)
    assert t8.insert(72) is True
    assert t8.root.keys == [65]
    assert [c.keys for c in t8.root.children] == [[30, 50], [75]]
    assert [c.keys for c in t8.root.children[0].children] == [[10, 20], [40], [52, 60]]
    assert [c.keys for c in t8.root.children[1].children] == [[72], [80, 91]]
    verify_invariants(t8)

    # 4. Slide 10: delete leaf 7 & delete internal 10
    t10a = BTree(3)
    t10a.root = make_node([10, 20], [make_node([5, 7]), make_node([12]), make_node([25])])
    assert t10a.delete(7) is True
    assert t10a.root.children[0].keys == [5]
    verify_invariants(t10a)

    t10b = BTree(3)
    t10b.root = make_node([10, 20], [make_node([5, 7]), make_node([12, 17]), make_node([25, 30])])
    assert t10b.delete(10) is True
    assert t10b.root.keys == [7, 20]
    assert t10b.root.children[0].keys == [5]
    verify_invariants(t10b)

    # 5. Slide 11: Borrow vs Merge on delete(5)
    t11a = BTree(3)
    t11a.root = make_node([10, 20], [make_node([5]), make_node([12, 17]), make_node([25])])
    assert t11a.delete(5) is True
    assert t11a.root.keys == [12, 20]
    assert [c.keys for c in t11a.root.children] == [[10], [17], [25]]
    verify_invariants(t11a)

    t11b = BTree(3)
    t11b.root = make_node([10, 20], [make_node([5]), make_node([12]), make_node([25])])
    assert t11b.delete(5) is True
    assert t11b.root.keys == [20]
    assert [c.keys for c in t11b.root.children] == [[10, 12], [25]]
    verify_invariants(t11b)

    # 6. Slide 12: Trace delete(5) & root shrink
    t12 = BTree(3)
    t12.root = make_node([10], [
        make_node([6], [make_node([5]), make_node([7])]),
        make_node([20], [make_node([12, 17]), make_node([30])]),
    ])
    verify_invariants(t12)
    assert t12.delete(5) is True
    assert t12.root.keys == [10, 20]
    assert [c.keys for c in t12.root.children] == [[6, 7], [12, 17], [30]]
    verify_invariants(t12)

    # 7. Delete last key of tree -> root becomes valid empty leaf
    t_empty = BTree(3)
    assert t_empty.insert(42) is True
    assert t_empty.delete(42) is True
    assert t_empty.root.leaf is True
    assert t_empty.root.keys == []
    assert t_empty.root.children == []
    verify_invariants(t_empty)

    print("All B-tree verification tests PASSED!")


if __name__ == "__main__":
    run_tests()
