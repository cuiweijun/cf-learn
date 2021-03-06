class Compiler {
  constructor(vm) {
    this.el = vm.$el;
    this.vm = vm;
    console.log(this.el, 'this.el')
    this.compile(this.el);
  }

  // 编译模板处理文本节点和元素节点
  compile(el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      // 处理文本节点
      if(this.isTextNode(node)) {
        this.compileText(node)
      } else if(this.isElementNode(node)) {
        this.compileElement(node)
      }
      
      // 判断node节点是否有子节点，如果有子节点，递归调用compiler
      if(node.childNodes && node.childNodes.length) {
        this.compile(node);
      }
    })

  }

  update(node, key, attrName) {
    let updateFn = this[attrName + 'Updater'];
    updateFn && updateFn.call(this, node, this.vm[key], key);
  }

  // 处理v-text指令
  textUpdater(node, value, key) {
    node.textContent = value;
    console.log(node, value, key)
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue;
    })
  }

  // v-model
  modelUpdater(node, value, key) {
    console.dir(node)
    node.value = value;
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue;
    })

    // 双向绑定
    node.addEventListener('input', () => {
      this.vm[key] = node.value;
    })
  }

  // v-html
  htmlUpdater(node, value, key) {
    node.innerHTML = value
    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue;
    })
  }

  // v-on
  onUpdater(node, value, key) {
    node.onclick = value.bind(this.vm);
    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue;
    })
  }

  // 编译元素节点，处理指令
  compileElement(node) {
    // console.log(node.attributes)
    // 遍历所有的属性节点
    // 判断是否有指令
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name;
      if (this.isDirective(attrName)) {
        // v-text --> text
        attrName = attrName.substr(2);

        let key = attr.value;

        console.log(attrName, 'key')

        this.update(node, key, attrName);

        new Watcher(this.vm, key, (newValue) => {

          this.update(node, key, attrName);
        })
      }
    })
  }

  // 编译文本节点，处理插值表达式
  compileText(node) {
    // 以对象的形式打印出来
    // console.dir(node)
    // {{msg}}
    let reg = /\{\{(.+?)\}\}/;

    let value = node.textContent;
    if (reg.test(value)) {
      let key = RegExp.$1.trim();
      node.textContent = value.replace(reg, this.vm[key]);
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = newValue;
      })
    }
  }


  // 判断元素属性是否是指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }

  // 判断节点是否是文本节点
  isTextNode(node) {
    return node.nodeType === 3
  }

  // 判断节点是否是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }

}