// Watcher
class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    // 获取当前的值
    this.val = this.get();
  }
  get() {
    // 将当前的Watcher实例添加到Dep类的静态属性
    Dep.target = this;

    // 获取当前的值
    let curVal = compileDirectives.getVal(this.vm, this.exp);

    // 清空Dep上的Watcher属性
    Dep.target = null;
    return curVal;
  }
  update() {
    // 获取新值
    let newVal = compileDirectives.getVal(this.vm, this.exp);
    // 获取旧值
    let oldVal = this.val;
    // 如果新值和旧值不相等，则执行回调方法进行值更新
    if (newVal !== oldVal) {
      this.cb(newVal);
    }
  }
}

// 发布订阅 Dep
class Dep {
  constructor() {
    // 创建订阅队列
    this.subs = [];
  }
  // 添加队列
  addSub(watcher) {
    this.subs.push(watcher);
  }
  // 通知
  notify() {
    this.subs.forEach((watcher) => {
      // 执行update方法
      watcher.update();
    });
  }
}

// 数据劫持 Observer
class Observer {
  constructor(data) {
    this.observer(data);
  }
  observer(data) {
    // 如果data不存在或者类型不是对象，则返回
    if (!data || typeof data !== "object") {
      return;
    }
    // 获取vm.$data的key和value,完成所有属性的数据劫持
    Object.keys(data).forEach((key) => {
      this.dataReactive(data, key, data[key]);
      // 深度数据劫持
      this.observer(data[key]);
    });
  }
  // 实现数据响应式
  dataReactive(object, key, val) {
    // 保存当前this
    let _this = this;
    // 每一个属性对应一个订阅类
    let dep = new Dep();

    // 对一个属性进行数据劫持
    Object.defineProperty(object, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 获取属性的值
        Dep.target && dep.addSub(Dep.target);
        return val;
      },
      set(newVal) {
        if (newVal !== val) {
          // 如果新值是对象，则进行深度劫持
          _this.observer(newVal);
          val = newVal;
          // 通知更新属性的值
          dep.notify();
        }
      },
    });
  }
}

// 模版编译
class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    if (this.el) {
      let fragment = this.addElementToFragment(this.el);
      // 编译文档片段
      this.compileFragment(fragment);
      // 将编译好的文档再添加到页面中
      this.el.appendChild(fragment);
    }
  }
  // 判断是否为元素节点 ELEMENT_NODE
  isElementNode(el) {
    return el.nodeType === 1;
  }
  isDirective(name) {
    return name.includes("v-");
  }
  addElementToFragment(el) {
    // 创建文档片段
    let fragment = document.createDocumentFragment();
    // 依次取出子节点放入文档片段中
    let firstChild;
    while ((firstChild = el.firstChild)) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }
  //编译文档片段
  compileFragment(fragment) {
    // 获取子节点
    let childNodes = fragment.childNodes;
    // 判断每一个节点类型
    Array.from(childNodes).forEach((node) => {
      if (this.isElementNode(node)) {
        // 编译元素节点
        this.compileElement(node);
        // 如果是元素节点，则递归执行
        this.compileFragment(node);
      } else {
        // 编译文本节点
        this.compileText(node);
      }
    });
  }
  // 编译元素节点
  compileElement(node) {
    // 获取节点所有属性
    let attrs = node.attributes;
    // 判断属性是否为指令
    Array.from(attrs).forEach((attr) => {
      // 获取属性名
      let attrName = attr.name;
      if (this.isDirective(attrName)) {
        // 获取表达式
        let exp = attr.value;
        // 获取方法类型
        let [, type] = attrName.split("-");
        // 编译对应类型的指令方法
        compileDirectives[type](node, this.vm, exp);
      }
    });
  }
  // 编译文本节点
  compileText(node) {
    // 获取文本节点内容
    let exp = node.textContent;
    // 创建匹配双括号{{}}的正则表达式
    let reg = /\{\{(.+?)\}\}/g;

    if (reg.test(exp)) {
      // 编译文本类型的指令方法
      compileDirectives["text"](node, this.vm, exp);
    }
  }
}
// 编译指令
const compileDirectives = {
  // 更新节点数据方法
  updates: {
    // 文本更新
    updateText(node, value) {
      node.textContent = value;
    },
    // v-model更新
    updateModel(node, value) {
      node.value = value;
    },
    // 可扩展
  },
  getVal(vm, exp) {
    // 将表达式按点分割
    exp = exp.split(".");

    //reduce归并求值
    return exp.reduce((acc, cur) => {
      return acc[cur];
    }, vm.$data);
  },
  // 获取vm.$data的值
  getTextVal(vm, exp) {
    let reg = /\{\{(.+?)\}\}/g;
    return exp.replace(reg, (...args) => {
      return this.getVal(vm, args[1]);
    });
  },
  // 设置vm.$data的值
  setVal(vm, exp, newVal) {
    exp = exp.split(".");
    return exp.reduce((acc, cur, curIndex) => {
      // 如果当前归并为数组最后一项，则将新值设置到该属性,否则继续执行归并求值
      if (curIndex === exp.length - 1) {
        return (acc[cur] = newVal);
      } else {
        return acc[cur];
      }
    }, vm.$data);
  },
  // 实现v-model
  model(node, vm, exp) {
    // 获取更新方法
    let updateModel = this.updates["updateModel"];
    // 获取vm.$data中对应的变量的值
    let val = this.getVal(vm, exp);

    // 添加watcher
    new Watcher(vm, exp, (newVal) => {
      updateModel && updateModel(node, newVal);
    });
    // 对input进行数据监听
    node.addEventListener("input", (e) => {
      // 获取当前的input值
      let newVal = e.target.value;
      // 将当前的值更新到node
      this.setVal(vm, exp, newVal);
    });
    // 初始化
    updateModel && updateModel(node, val);
  },
  // 处理{{}}中的文本
  text(node, vm, exp) {
    //获取更新方法
    let updateText = this.updates["updateText"];
    // 获取vm.$data中对应的变量的值
    let val = this.getTextVal(vm, exp);

    // 添加Watcher
    let reg = /\{\{(.+?)\}\}/g;
    exp.replace(reg, (...args) => {
      new Watcher(vm, args[1], (newVal) => {
        updateText && updateText(node, newVal);
      });
    });
    // 初始化
    updateText && updateText(node, val);
  },
};

//Mvvm
class Mvvm {
  constructor(options) {
    // 将el和data挂载到当前实例上
    this.$el = options.el;
    this.$data = options.data;

    if (this.$el) {
      // 将data对象所有的属性添加getter和setter方法
      new Observer(this.$data);
      // 将data对象所有的属性挂载到当前实例上
      this.dataProxy(this.$data);
      // 在当前实例上执行模版编译
      new Compile(this.$el, this);
    }
  }
  // 数据代理
  dataProxy(data) {
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(newVal) {
          data[key] = newVal;
        },
      });
    });
  }
}
