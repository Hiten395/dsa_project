const $ = (selector) => document.querySelector(selector);
const listSeed = [8, 14, 21, 33, 47];
let list = [...listSeed];
let selectedList = null;
let highlightedList = null;
let listTimer;

class TreeNode {
  constructor(key) { this.key = key; this.left = null; this.right = null; }
}

class BinarySearchTree {
  constructor() { this.root = null; }
  search(key, node = this.root) {
    if (!node || node.key === key) return node;
    return key < node.key ? this.search(key, node.left) : this.search(key, node.right);
  }
  insert(key) {
    if (!this.root) { this.root = new TreeNode(key); return true; }
    let node = this.root;
    while (true) {
      if (key === node.key) return false;
      const side = key < node.key ? 'left' : 'right';
      if (!node[side]) { node[side] = new TreeNode(key); return true; }
      node = node[side];
    }
  }
  delete(key) {
    let removed = false;
    const removeNode = (node, value) => {
      if (!node) return null;
      if (value < node.key) node.left = removeNode(node.left, value);
      else if (value > node.key) node.right = removeNode(node.right, value);
      else {
        removed = true;
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        let successor = node.right;
        while (successor.left) successor = successor.left;
        node.key = successor.key;
        node.right = removeNode(node.right, successor.key);
        removed = true;
      }
      return node;
    };
    this.root = removeNode(this.root, key);
    return removed;
  }
  allKeys() { return this.inorder(); }
  inorder(node = this.root, out = []) { if (!node) return out; this.inorder(node.left, out); out.push(node.key); this.inorder(node.right, out); return out; }
  preorder(node = this.root, out = []) { if (!node) return out; out.push(node.key); this.preorder(node.left, out); this.preorder(node.right, out); return out; }
  postorder(node = this.root, out = []) { if (!node) return out; this.postorder(node.left, out); this.postorder(node.right, out); out.push(node.key); return out; }
  levelorder() {
    if (!this.root) return [];
    const out = [], queue = [this.root];
    while (queue.length) { const node = queue.shift(); out.push(node.key); if (node.left) queue.push(node.left); if (node.right) queue.push(node.right); }
    return out;
  }
}

let tree = new BinarySearchTree();
const treeSeed = [18, 7, 26, 3, 11, 22, 31, 1, 5, 9, 14];
treeSeed.forEach((key) => tree.insert(key));
let selectedTree = null;
let highlightedTree = null;
let treeTimer;

function listType() { return $('#list-type').value; }
function renderList() {
  const canvas = $('#list-canvas');
  $('#list-count').textContent = String(list.length).padStart(2, '0');
  const type = listType();
  canvas.classList.toggle('circular-list', type === 'circular' && list.length > 0);
  if (!list.length) { canvas.innerHTML = '<span class="head-label">HEAD</span><span class="null-end">EMPTY</span>'; return; }
  let html = '<span class="head-label">HEAD</span><div class="list-track">';
  list.forEach((value, index) => {
    html += `<div class="node-wrap"><button class="list-node ${selectedList === index ? 'selected' : ''} ${highlightedList === index ? 'flash-node' : ''}" data-index="${index}" aria-label="Node ${index + 1}, value ${value}"><span class="node-index">${String(index).padStart(2, '0')}</span><span class="node-value">${value}</span><span class="node-pointer">${index === list.length - 1 && type !== 'circular' ? 'NULL' : 'PTR'}</span></button></div>`;
    if (index < list.length - 1) html += `<span class="list-link ${type}" aria-hidden="true"><i></i></span>`;
  });
  if (type !== 'circular') html += '<span class="null-end">NULL</span>';
  html += '</div>';
  canvas.innerHTML = html;
  if (type === 'circular') drawCircularPointer(canvas);
  canvas.querySelectorAll('.list-node').forEach((button) => button.addEventListener('click', () => {
    selectedList = Number(button.dataset.index); $('#list-target').value = list[selectedList]; renderList(); setListStatus(`Selected node ${selectedList + 1} · value ${list[selectedList]}.`);
  }));
}
function drawCircularPointer(canvas) {
  const nodes = canvas.querySelectorAll('.list-node');
  if (!nodes.length) return;
  const first = nodes[0].getBoundingClientRect(), last = nodes[nodes.length - 1].getBoundingClientRect();
  const area = canvas.getBoundingClientRect(), scrollX = canvas.scrollLeft;
  const width = Math.max(canvas.scrollWidth, canvas.clientWidth), height = canvas.clientHeight;
  const x1 = last.right - area.left + scrollX, y1 = last.bottom - area.top;
  const x2 = first.left - area.left + first.width / 2 + scrollX, y2 = first.bottom - area.top;
  const loopY = Math.min(height - 22, Math.max(y1, y2) + 31);
  canvas.insertAdjacentHTML('beforeend', `<svg class="circular-pointer" width="${width}" height="${height}" aria-hidden="true"><defs><marker id="loop-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L6,3.5 L0,7" fill="none" stroke="currentColor" stroke-width="1.2"/></marker></defs><path d="M ${x1} ${y1} V ${loopY} H ${x2} V ${y2 + 4}" marker-end="url(#loop-arrow)"/><text x="${(x1 + x2) / 2}" y="${loopY - 5}" text-anchor="middle">TAIL → HEAD</text></svg>`);
}
function setListStatus(message) { $('#list-status').textContent = message; }
function listValue(selector) { const value = Number($(selector).value); return Number.isFinite(value) && $(selector).value.trim() !== '' ? value : null; }
function traverseList() {
  clearInterval(listTimer); const output = $('#list-output'); output.textContent = list.length ? 'Walking pointers…' : 'The list is empty.';
  let i = 0; highlightedList = null; renderList();
  if (!list.length) return;
  listTimer = setInterval(() => {
    if (i >= list.length) { clearInterval(listTimer); highlightedList = null; renderList(); output.textContent = list.join(listType() === 'circular' ? ' → ' : ' → ') + (listType() === 'circular' ? ' → HEAD' : ' → NULL'); output.classList.add('flash'); setTimeout(() => output.classList.remove('flash'), 500); return; }
    highlightedList = i; renderList(); i++;
  }, 380);
}

function renderTree() {
  const canvas = $('#tree-canvas'), root = tree.root;
  $('#tree-count').textContent = String(tree.allKeys().length).padStart(2, '0');
  if (!root) { canvas.innerHTML = '<div class="empty-tree">EMPTY TREE</div>'; return; }
  const nodes = [], keyPositions = new Map(); let rank = 0, maxDepth = 0;
  function place(node, depth = 0, parent = null) {
    if (!node) return;
    maxDepth = Math.max(maxDepth, depth);
    place(node.left, depth + 1, node);
    const x = 35 + rank * 68, y = 22 + depth * 66;
    const item = { node, x, y, w: 40, parent };
    rank++; nodes.push(item); keyPositions.set(node, item);
    place(node.right, depth + 1, node);
  }
  place(root);
  const width = Math.max(530, 70 + Math.max(0, rank - 1) * 68), svgH = Math.max(230, 65 + maxDepth * 66);
  let edges = '';
  nodes.forEach(({ node, x, y, parent }) => {
    if (parent) {
      const parentNode = keyPositions.get(parent);
      edges += `<line class="tree-edge" x1="${parentNode.x + 20}" y1="${parentNode.y + 38}" x2="${x + 20}" y2="${y}"/>`;
    }
  });
  let boxes = '';
  nodes.forEach(({ node, x, y }) => {
    const key = node.key, active = key === highlightedTree;
    boxes += `<g class="tree-node ${active ? 'active' : ''}"><rect class="tree-box" x="${x}" y="${y}" width="40" height="38"/><text class="tree-key ${selectedTree === key ? 'active' : ''}" data-key="${key}" x="${x + 20}" y="${y + 24}" text-anchor="middle">${key}</text></g>`;
  });
  canvas.innerHTML = `<svg class="tree-svg" viewBox="0 0 ${width} ${svgH}" role="img" aria-label="Binary search tree with ${tree.allKeys().length} keys">${edges}${boxes}</svg>`;
  canvas.querySelectorAll('.tree-key').forEach((keyEl) => keyEl.addEventListener('click', () => {
    selectedTree = Number(keyEl.dataset.key); $('#tree-target').value = selectedTree; renderTree(); setTreeStatus(`Selected key ${selectedTree}.`);
  }));
}
function setTreeStatus(message) { $('#tree-status').textContent = message; }
function treeValue(selector) { const value = Number($(selector).value); return Number.isFinite(value) && $(selector).value.trim() !== '' ? value : null; }
function treeTraversal() {
  clearInterval(treeTimer); const kind = $('#tree-traversal').value;
  const result = tree[kind](); let i = 0;
  if (!result.length) { $('#tree-output').textContent = 'The tree is empty.'; return; }
  $('#tree-output').textContent = `${kind[0].toUpperCase() + kind.slice(1)}: `;
  treeTimer = setInterval(() => {
    if (i >= result.length) { clearInterval(treeTimer); highlightedTree = null; renderTree(); return; }
    highlightedTree = result[i]; renderTree(); $('#tree-output').textContent = `${kind[0].toUpperCase() + kind.slice(1)}: ${result.slice(0, i + 1).join(' · ')}`; i++;
  }, 360);
}

document.querySelectorAll('.structure-tab').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.structure-tab').forEach((tab) => tab.classList.toggle('active', tab === button));
  document.querySelectorAll('.panel').forEach((panel) => panel.classList.toggle('active', panel.id === button.dataset.panel));
}));
$('#list-type').addEventListener('change', renderList);
$('#list-insert').addEventListener('click', () => {
  const value = listValue('#list-value'); if (value === null) return setListStatus('Enter a numeric value to insert.');
  list.push(value); selectedList = list.length - 1; $('#list-value').value = ''; renderList(); setListStatus(`Inserted ${value} at the tail.`);
});
$('#list-delete').addEventListener('click', () => {
  const value = listValue('#list-target'); if (value === null) return setListStatus('Choose a node or enter a target value.');
  const index = list.indexOf(value); if (index < 0) return setListStatus(`${value} is not in this list.`);
  list.splice(index, 1); selectedList = null; renderList(); setListStatus(`Removed ${value} from the list.`);
});
$('#list-update-button').addEventListener('click', () => {
  const old = listValue('#list-target'), value = listValue('#list-update');
  if (old === null || value === null) return setListStatus('Enter a target value and its replacement.');
  const index = list.indexOf(old); if (index < 0) return setListStatus(`${old} is not in this list.`);
  list[index] = value; selectedList = index; renderList(); setListStatus(`Updated node ${index + 1}: ${old} → ${value}.`);
});
$('#list-traverse').addEventListener('click', traverseList);
$('#list-reset').addEventListener('click', () => { list = [...listSeed]; selectedList = highlightedList = null; $('#list-output').textContent = listSeed.join(' → '); renderList(); setListStatus('Example list restored.'); });

$('#tree-insert').addEventListener('click', () => {
  const value = treeValue('#tree-value'); if (value === null) return setTreeStatus('Enter a numeric key to insert.');
  const inserted = tree.insert(value); $('#tree-value').value = ''; selectedTree = inserted ? value : null; renderTree(); setTreeStatus(inserted ? `Inserted ${value} in its ordered position.` : `${value} already exists in the tree.`);
});
$('#tree-delete').addEventListener('click', () => {
  const value = treeValue('#tree-target'); if (value === null) return setTreeStatus('Choose a key or enter a target key.');
  const removed = tree.delete(value); selectedTree = null; renderTree(); setTreeStatus(removed ? `Removed ${value} from the tree.` : `${value} is not in this tree.`);
});
$('#tree-update-button').addEventListener('click', () => {
  const old = treeValue('#tree-target'), value = treeValue('#tree-update');
  if (old === null || value === null) return setTreeStatus('Enter a target key and its replacement.');
  if (!tree.search(old)) return setTreeStatus(`${old} is not in this tree.`);
  if (old !== value && tree.search(value)) return setTreeStatus(`${value} already exists; tree keys must be unique.`);
  tree.delete(old); tree.insert(value); selectedTree = value; renderTree(); setTreeStatus(`Updated key ${old} → ${value}.`);
});
$('#tree-traverse').addEventListener('click', treeTraversal);

renderList(); renderTree();
