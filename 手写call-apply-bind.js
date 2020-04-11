/**
 * this 指向 1-4动态确定，5定义时确定
 * 1.默认绑定 window
 * 2.隐式绑定 谁调用指向谁
 * 3.显示绑定 call,apply,bind
 * 4.new绑定 指向new的对象
 * 5.=>函数 指向父作用域
 */
// 手写apply
Function.prototype.apply = function(context,args){
    // 默认上下文window
    const context = context || window;
    
}