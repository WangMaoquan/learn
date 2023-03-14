import{_ as n,V as s,W as a,Z as p}from"./framework-158893ce.js";const t={},e=p(`<h2 id="引入" tabindex="-1"><a class="header-anchor" href="#引入" aria-hidden="true">#</a> 引入</h2><p>就我来说, 挂载和更新其实就是一个方法, 只是通过参数来控制是去 <code>mount</code> or <code>update</code></p><p>因为 <code>vue</code> 是 <code>组件级更新</code>, 什么是 <code>组件级更新</code> 就是 每次更新都是 以<code>组件</code> 为单位去更新</p><p>这里的 <code>mount</code> 可以分为 <code>app</code> 和 <code>component</code></p><p>这里的 <code>update</code> 也可以分为<code>app</code> 和 <code>component</code>, 但是 <code>app</code> 的 更新只有 <code>unmount</code></p><p>下面是我进行断点调试的例子</p><div class="language-html line-numbers-mode" data-ext="html"><pre class="language-html"><code><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>div</span> <span class="token attr-name">id</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>app<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>div</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span> <span class="token attr-name">src</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">&quot;</span>../../dist/vue.global.js<span class="token punctuation">&quot;</span></span><span class="token punctuation">&gt;</span></span><span class="token script"></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">
  <span class="token keyword">const</span> <span class="token punctuation">{</span> defineComponent<span class="token punctuation">,</span> createApp<span class="token punctuation">,</span> h<span class="token punctuation">,</span> ref <span class="token punctuation">}</span> <span class="token operator">=</span> Vue<span class="token punctuation">;</span>

  <span class="token keyword">const</span> compA <span class="token operator">=</span> <span class="token function">defineComponent</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;compA&#39;</span><span class="token punctuation">,</span>
    <span class="token function">setup</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">h</span><span class="token punctuation">(</span><span class="token string">&#39;div&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;this is A component&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> compB <span class="token operator">=</span> <span class="token function">defineComponent</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;compB&#39;</span><span class="token punctuation">,</span>
    <span class="token function">setup</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token function">h</span><span class="token punctuation">(</span><span class="token string">&#39;div&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;this is B component&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> compC <span class="token operator">=</span> <span class="token function">defineComponent</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;compC&#39;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">props</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&#39;change&#39;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token function">setup</span><span class="token punctuation">(</span><span class="token parameter">props</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">(</span>props<span class="token punctuation">.</span>change <span class="token operator">?</span> <span class="token function">h</span><span class="token punctuation">(</span>compA<span class="token punctuation">)</span> <span class="token operator">:</span> <span class="token function">h</span><span class="token punctuation">(</span>compB<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token keyword">const</span> App <span class="token operator">=</span> <span class="token function">defineComponent</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;app&#39;</span><span class="token punctuation">,</span>
    <span class="token function">setup</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">const</span> change <span class="token operator">=</span> <span class="token function">ref</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

      <span class="token keyword">return</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span>
        <span class="token function">h</span><span class="token punctuation">(</span><span class="token string">&#39;div&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">[</span>
          <span class="token function">h</span><span class="token punctuation">(</span>
            <span class="token string">&#39;button&#39;</span><span class="token punctuation">,</span>
            <span class="token punctuation">{</span> <span class="token function-variable function">onClick</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">(</span>change<span class="token punctuation">.</span>value <span class="token operator">=</span> <span class="token operator">!</span>change<span class="token punctuation">.</span>value<span class="token punctuation">)</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token string">&#39;click to change value&#39;</span><span class="token punctuation">,</span>
          <span class="token punctuation">)</span><span class="token punctuation">,</span>
          <span class="token function">h</span><span class="token punctuation">(</span>compC<span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">change</span><span class="token operator">:</span> change<span class="token punctuation">.</span>value <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">createApp</span><span class="token punctuation">(</span>App<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">mount</span><span class="token punctuation">(</span><span class="token string">&#39;#app&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="app" tabindex="-1"><a class="header-anchor" href="#app" aria-hidden="true">#</a> app</h2><p>主要是 <code>app</code> 的 <code>mount</code> 与 <code>unmount</code></p><h3 id="createapp" tabindex="-1"><a class="header-anchor" href="#createapp" aria-hidden="true">#</a> createApp</h3><p>是由 <code>createAppApi</code> 方法 返回的, 所以我们主要讲讲 <code>createAppApi</code> 就好</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">export</span> <span class="token keyword">function</span> <span class="token generic-function"><span class="token function">createAppAPI</span><span class="token generic class-name"><span class="token operator">&lt;</span>HostElement<span class="token operator">&gt;</span></span></span><span class="token punctuation">(</span>
  render<span class="token operator">:</span> RootRenderFunction<span class="token operator">&lt;</span>HostElement<span class="token operator">&gt;</span><span class="token punctuation">,</span>
  hydrate<span class="token operator">?</span><span class="token operator">:</span> RootHydrateFunction<span class="token punctuation">,</span>
<span class="token punctuation">)</span><span class="token operator">:</span> CreateAppFunction<span class="token operator">&lt;</span>HostElement<span class="token operator">&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token keyword">function</span> <span class="token function">createApp</span><span class="token punctuation">(</span>rootComponent<span class="token punctuation">,</span> rootProps <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 省略代码</span>

    <span class="token keyword">const</span> context <span class="token operator">=</span> <span class="token function">createAppContext</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">const</span> installedPlugins <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Set</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">let</span> isMounted <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

    <span class="token keyword">const</span> app<span class="token operator">:</span> App <span class="token operator">=</span> <span class="token punctuation">(</span>context<span class="token punctuation">.</span>app <span class="token operator">=</span> <span class="token punctuation">{</span>
      _uid<span class="token operator">:</span> uid<span class="token operator">++</span><span class="token punctuation">,</span>
      _component<span class="token operator">:</span> rootComponent <span class="token keyword">as</span> ConcreteComponent<span class="token punctuation">,</span>
      _props<span class="token operator">:</span> rootProps<span class="token punctuation">,</span>
      _container<span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
      _context<span class="token operator">:</span> context<span class="token punctuation">,</span>
      _instance<span class="token operator">:</span> <span class="token keyword">null</span><span class="token punctuation">,</span>

      version<span class="token punctuation">,</span>

      <span class="token keyword">get</span> <span class="token function">config</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> context<span class="token punctuation">.</span>config<span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>

      <span class="token keyword">set</span> <span class="token function">config</span><span class="token punctuation">(</span>v<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>__DEV__<span class="token punctuation">)</span> <span class="token punctuation">{</span>
          <span class="token function">warn</span><span class="token punctuation">(</span>
            <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">app.config cannot be replaced. Modify individual options instead.</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">,</span>
          <span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>

      <span class="token function">use</span><span class="token punctuation">(</span>plugin<span class="token operator">:</span> Plugin<span class="token punctuation">,</span> <span class="token operator">...</span>options<span class="token operator">:</span> <span class="token builtin">any</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 省略代码</span>
        <span class="token keyword">return</span> app<span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>

      <span class="token function">mixin</span><span class="token punctuation">(</span>mixin<span class="token operator">:</span> ComponentOptions<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 省略代码</span>
        <span class="token keyword">return</span> app<span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>

      <span class="token function">component</span><span class="token punctuation">(</span>name<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> component<span class="token operator">?</span><span class="token operator">:</span> Component<span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">any</span> <span class="token punctuation">{</span>
        <span class="token comment">// 省略代码</span>
        <span class="token keyword">return</span> app<span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>

      <span class="token function">directive</span><span class="token punctuation">(</span>name<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> directive<span class="token operator">?</span><span class="token operator">:</span> Directive<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 省略代码</span>
        <span class="token keyword">return</span> app<span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>

      <span class="token function">mount</span><span class="token punctuation">(</span>
        rootContainer<span class="token operator">:</span> HostElement<span class="token punctuation">,</span>
        isHydrate<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span>
        isSVG<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span>
      <span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">any</span> <span class="token punctuation">{</span>
        <span class="token comment">// 省略代码</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>

      <span class="token function">unmount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 省略代码</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>

      <span class="token function">provide</span><span class="token punctuation">(</span>key<span class="token punctuation">,</span> value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 省略代码</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 省略代码</span>

    <span class="token keyword">return</span> app<span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container note"><p class="hint-container-title">createAppApi</p><ol><li>接收的参数一共两个 <code>render</code> 与 <code>hydrate</code>, 渲染方法 与 注水的方法(字面翻译 <code>同构渲染</code> 会用到)</li><li>主要返回的是一个 <code>app</code> 对象, 这个对象包含了, 我们注册插件的 <code>use</code>, 注册组件的 <code>component</code>, 注册指令的 <code>directive</code>, 注入依赖的 <code>provide</code>, 使用混入的 <code>minix</code>, 以及 <code>mount</code>, <code>unmount</code></li></ol><p>这里我们主要看 <code>mount</code></p></div><h3 id="mount" tabindex="-1"><a class="header-anchor" href="#mount" aria-hidden="true">#</a> mount</h3><p>其实 <code>app</code> 的 <code>mount</code> 最主要做的就两件事</p><ol><li>挂载 <code>app</code> 的 <code>rootComponent</code></li><li>修改 <code>isMounted</code> 状态</li></ol><p>下面我们看代码</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> app <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token comment">// 省略</span>
  <span class="token doc-comment comment">/**
   * rootContainer 就是我们传入的 id为app 的那个dom
   * isHydrate 是否是注水
   * isSVG 是否是svg 元素
   */</span>
  <span class="token function">mount</span><span class="token punctuation">(</span>rootContainer<span class="token operator">:</span> HostElement<span class="token punctuation">,</span> isHydrate<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span> isSVG<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">any</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>isMounted<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// 这里就是挂载 自己的 rootComponent</span>
      <span class="token keyword">const</span> vnode <span class="token operator">=</span> <span class="token function">createVNode</span><span class="token punctuation">(</span>rootComponent <span class="token keyword">as</span> ConcreteComponent<span class="token punctuation">,</span> rootProps<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token function">render</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> rootContainer<span class="token punctuation">,</span> isSVG<span class="token punctuation">)</span><span class="token punctuation">;</span>
      isMounted <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span> <span class="token comment">// 修改状态</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="unmount" tabindex="-1"><a class="header-anchor" href="#unmount" aria-hidden="true">#</a> unmount</h3><p>其实 <code>app</code> 的 <code>unmount</code> 最主要做的就一件事</p><ol><li>卸载 <code>app</code> 的 <code>rootComponent</code></li></ol><p>下面我们看代码</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> app <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token function">unmount</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>isMounted<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">render</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> app<span class="token punctuation">.</span>_container<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="component" tabindex="-1"><a class="header-anchor" href="#component" aria-hidden="true">#</a> component</h2><p><code>rootComponent</code> 其实就是一个 <code>component</code>, 所以我们可以看 <code>render</code> 方法的实现</p><h3 id="render" tabindex="-1"><a class="header-anchor" href="#render" aria-hidden="true">#</a> render</h3><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> render<span class="token operator">:</span> <span class="token function-variable function">RootRenderFunction</span> <span class="token operator">=</span> <span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> container<span class="token punctuation">,</span> isSVG<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>vnode <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>container<span class="token punctuation">.</span>_vnode<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">unmount</span><span class="token punctuation">(</span>container<span class="token punctuation">.</span>_vnode<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    <span class="token function">patch</span><span class="token punctuation">(</span>container<span class="token punctuation">.</span>_vnode <span class="token operator">||</span> <span class="token keyword">null</span><span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> container<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> isSVG<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  container<span class="token punctuation">.</span>_vnode <span class="token operator">=</span> vnode<span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其实主要做的就是 根据 <code>vnode</code> 是否是 <code>null</code>, 来卸载 <code>unmount</code> 或者 挂载(更新) <code>patch</code></p><p><code>patch</code> 意为打补丁 <code>挂载</code>其实就是一种特殊的<code>更新</code></p><h3 id="unmount-1" tabindex="-1"><a class="header-anchor" href="#unmount-1" aria-hidden="true">#</a> unmount</h3><p>思考一下 unmount 会干些啥?</p><ol><li>首先想到的是 会删除 <code>vnode</code> 对应的 <code>dom</code></li><li><code>dom</code> 都想到了, 是不是还会想到 <code>dom</code> 的引用 <code>ref</code></li><li>触发钩子(<code>beforeUnmount</code>, <code>unmounted</code>)</li><li>修改 <code>isUnmounted</code> 状态</li></ol><p>下面看代码</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> unmount<span class="token operator">:</span> <span class="token function-variable function">UnmountFn</span> <span class="token operator">=</span> <span class="token punctuation">(</span>
  vnode<span class="token punctuation">,</span>
  parentComponent<span class="token punctuation">,</span>
  parentSuspense<span class="token punctuation">,</span>
  doRemove <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
  optimized <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">{</span>
    type<span class="token punctuation">,</span>
    props<span class="token punctuation">,</span>
    ref<span class="token punctuation">,</span>
    children<span class="token punctuation">,</span>
    dynamicChildren<span class="token punctuation">,</span>
    shapeFlag<span class="token punctuation">,</span>
    patchFlag<span class="token punctuation">,</span>
    dirs<span class="token punctuation">,</span>
  <span class="token punctuation">}</span> <span class="token operator">=</span> vnode<span class="token punctuation">;</span>

  <span class="token comment">// 解除ref</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>ref <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">setRef</span><span class="token punctuation">(</span>ref<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> parentSuspense<span class="token punctuation">,</span> vnode<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 省略代码</span>

  <span class="token comment">// 如果 是 element 元素 且存在 指令</span>
  <span class="token keyword">const</span> shouldInvokeDirs <span class="token operator">=</span> shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">ELEMENT</span> <span class="token operator">&amp;&amp;</span> dirs<span class="token punctuation">;</span>

  <span class="token comment">// vnode 是不是一个异步的</span>
  <span class="token keyword">const</span> shouldInvokeVnodeHook <span class="token operator">=</span> <span class="token operator">!</span><span class="token function">isAsyncWrapper</span><span class="token punctuation">(</span>vnode<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// 执行 onVnodeBeforeUnmount</span>
  <span class="token keyword">let</span> vnodeHook<span class="token operator">:</span> VNodeHook <span class="token operator">|</span> <span class="token keyword">undefined</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>
    shouldInvokeVnodeHook <span class="token operator">&amp;&amp;</span>
    <span class="token punctuation">(</span>vnodeHook <span class="token operator">=</span> props <span class="token operator">&amp;&amp;</span> props<span class="token punctuation">.</span>onVnodeBeforeUnmount<span class="token punctuation">)</span>
  <span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">invokeVNodeHook</span><span class="token punctuation">(</span>vnodeHook<span class="token punctuation">,</span> parentComponent<span class="token punctuation">,</span> vnode<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">//  卸载 component</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">COMPONENT</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">unmountComponent</span><span class="token punctuation">(</span>vnode<span class="token punctuation">.</span>component<span class="token operator">!</span><span class="token punctuation">,</span> parentSuspense<span class="token punctuation">,</span> doRemove<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    <span class="token comment">// 省略</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>shouldInvokeDirs<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">invokeDirectiveHook</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> parentComponent<span class="token punctuation">,</span> <span class="token string">&#39;beforeUnmount&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 卸载 子组件 代码</span>

    <span class="token comment">// 移出真实dom</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>doRemove<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">remove</span><span class="token punctuation">(</span>vnode<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// onVnodeUnmounted / unmounted hook</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>
    <span class="token punctuation">(</span>shouldInvokeVnodeHook <span class="token operator">&amp;&amp;</span> <span class="token punctuation">(</span>vnodeHook <span class="token operator">=</span> props <span class="token operator">&amp;&amp;</span> props<span class="token punctuation">.</span>onVnodeUnmounted<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">||</span>
    shouldInvokeDirs
  <span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">queuePostRenderEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      vnodeHook <span class="token operator">&amp;&amp;</span> <span class="token function">invokeVNodeHook</span><span class="token punctuation">(</span>vnodeHook<span class="token punctuation">,</span> parentComponent<span class="token punctuation">,</span> vnode<span class="token punctuation">)</span><span class="token punctuation">;</span>
      shouldInvokeDirs <span class="token operator">&amp;&amp;</span>
        <span class="token function">invokeDirectiveHook</span><span class="token punctuation">(</span>vnode<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> parentComponent<span class="token punctuation">,</span> <span class="token string">&#39;unmounted&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span> parentSuspense<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="unmountcomponent" tabindex="-1"><a class="header-anchor" href="#unmountcomponent" aria-hidden="true">#</a> unmountComponent</h3><p>这是卸载<code>函数组件或者状态组件</code>的 component</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> <span class="token function-variable function">unmountComponent</span> <span class="token operator">=</span> <span class="token punctuation">(</span>
  instance<span class="token operator">:</span> ComponentInternalInstance<span class="token punctuation">,</span>
  parentSuspense<span class="token operator">:</span> SuspenseBoundary <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  doRemove<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token comment">// 取出 bum(beforeUnmount) um(unmounted)</span>
  <span class="token keyword">const</span> <span class="token punctuation">{</span> bum<span class="token punctuation">,</span> scope<span class="token punctuation">,</span> update<span class="token punctuation">,</span> subTree<span class="token punctuation">,</span> um <span class="token punctuation">}</span> <span class="token operator">=</span> instance<span class="token punctuation">;</span>

  <span class="token comment">// call beforeUnmount</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>bum<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">invokeArrayFns</span><span class="token punctuation">(</span>bum<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 卸载子组件</span>
  <span class="token function">unmount</span><span class="token punctuation">(</span>subTree<span class="token punctuation">,</span> instance<span class="token punctuation">,</span> parentSuspense<span class="token punctuation">,</span> doRemove<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// call unmounted hook</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>um<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">queuePostRenderEffect</span><span class="token punctuation">(</span>um<span class="token punctuation">,</span> parentSuspense<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 修改状态</span>
  <span class="token function">queuePostRenderEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    instance<span class="token punctuation">.</span>isUnmounted <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span> parentSuspense<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="patch" tabindex="-1"><a class="header-anchor" href="#patch" aria-hidden="true">#</a> patch</h3><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token doc-comment comment">/***
 * n1 旧vnode
 * n2 新vnode
 * container 容器
 * anchor 锚点
 */</span>
<span class="token keyword">const</span> patch<span class="token operator">:</span> <span class="token function-variable function">PatchFn</span> <span class="token operator">=</span> <span class="token punctuation">(</span>
  n1<span class="token punctuation">,</span>
  n2<span class="token punctuation">,</span>
  container<span class="token punctuation">,</span>
  anchor <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  parentComponent <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  parentSuspense <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  isSVG <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
  slotScopeIds <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  optimized <span class="token operator">=</span> __DEV__ <span class="token operator">&amp;&amp;</span> isHmrUpdating <span class="token operator">?</span> <span class="token boolean">false</span> <span class="token operator">:</span> <span class="token operator">!</span><span class="token operator">!</span>n2<span class="token punctuation">.</span>dynamicChildren<span class="token punctuation">,</span>
<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token comment">// 相等话 是不需要 patch的</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>n1 <span class="token operator">===</span> n2<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// n1存在 且 ni n2 type 不一样 直接卸载n1 且重置为null</span>
  <span class="token comment">// 重置 就是相当于就是 patch(null, n2, container, ...)</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>n1 <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span><span class="token function">isSameVNodeType</span><span class="token punctuation">(</span>n1<span class="token punctuation">,</span> n2<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    anchor <span class="token operator">=</span> <span class="token function">getNextHostNode</span><span class="token punctuation">(</span>n1<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">unmount</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    n1 <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 省略代码</span>

  <span class="token comment">// 下面就是针对不同的type 快速命中</span>

  <span class="token keyword">const</span> <span class="token punctuation">{</span> type<span class="token punctuation">,</span> ref<span class="token punctuation">,</span> shapeFlag <span class="token punctuation">}</span> <span class="token operator">=</span> n2<span class="token punctuation">;</span>
  <span class="token keyword">switch</span> <span class="token punctuation">(</span>type<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">case</span> Text<span class="token operator">:</span> <span class="token comment">// 处理文本</span>
      <span class="token function">processText</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> Comment<span class="token operator">:</span> <span class="token comment">// 处理 注释</span>
      <span class="token function">processCommentNode</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> Static<span class="token operator">:</span> <span class="token comment">// 处理静态</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>n1 <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">mountStaticNode</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>__DEV__<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">patchStaticNode</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token keyword">case</span> Fragment<span class="token operator">:</span> <span class="token comment">// 处理 fragment</span>
      <span class="token function">processFragment</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token keyword">break</span><span class="token punctuation">;</span>
    <span class="token keyword">default</span><span class="token operator">:</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">ELEMENT</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 处理 div 之类的</span>
        <span class="token function">processElement</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">COMPONENT</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 处理 状态组件或者函数组件</span>
        <span class="token function">processComponent</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">TELEPORT</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 处理 teleport</span>
        <span class="token punctuation">(</span><span class="token keyword">type</span> <span class="token class-name"><span class="token keyword">as</span></span> <span class="token keyword">typeof</span> TeleportImpl<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">process</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>__FEATURE_SUSPENSE__ <span class="token operator">&amp;&amp;</span> shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">SUSPENSE</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 处理 suspense</span>
        <span class="token punctuation">(</span><span class="token keyword">type</span> <span class="token class-name"><span class="token keyword">as</span></span> <span class="token keyword">typeof</span> SuspenseImpl<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">process</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>__DEV__<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">warn</span><span class="token punctuation">(</span><span class="token string">&#39;Invalid VNode type:&#39;</span><span class="token punctuation">,</span> type<span class="token punctuation">,</span> <span class="token template-string"><span class="token template-punctuation string">\`</span><span class="token string">(</span><span class="token interpolation"><span class="token interpolation-punctuation punctuation">\${</span><span class="token keyword">typeof</span> <span class="token keyword">type</span><span class="token interpolation-punctuation punctuation">}</span></span><span class="token string">)</span><span class="token template-punctuation string">\`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 设置ref</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>ref <span class="token operator">!=</span> <span class="token keyword">null</span> <span class="token operator">&amp;&amp;</span> parentComponent<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">setRef</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我就举个 <code>processElement</code>, 最基本的肯定是 <code>patch element</code>了</p><h3 id="processelement" tabindex="-1"><a class="header-anchor" href="#processelement" aria-hidden="true">#</a> processElement</h3><p>就做一件事, n1 是否是 null, 是 <code>mount</code> 不是 <code>update</code></p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> <span class="token function-variable function">processElement</span> <span class="token operator">=</span> <span class="token punctuation">(</span>
  n1<span class="token operator">:</span> VNode <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  n2<span class="token operator">:</span> VNode<span class="token punctuation">,</span>
  container<span class="token operator">:</span> RendererElement<span class="token punctuation">,</span>
  anchor<span class="token operator">:</span> RendererNode <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  parentComponent<span class="token operator">:</span> ComponentInternalInstance <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  parentSuspense<span class="token operator">:</span> SuspenseBoundary <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  isSVG<span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span>
  slotScopeIds<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  optimized<span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>n1 <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">mountElement</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    <span class="token function">patchElement</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="mountelement" tabindex="-1"><a class="header-anchor" href="#mountelement" aria-hidden="true">#</a> mountElement</h3><ol><li>创建对应的 dom, 先创建 是为了 <code>挂载子节点</code> 时 提供挂载的地方</li><li>挂载子节点</li><li>触发指令的 <code>created</code> 钩子</li><li>设置 props</li><li>触发 vnode 的 <code>onVnodeBeforeMount</code> 钩子</li><li>触发指令的 <code>beforeMount</code> 钩子</li><li>判断是否需要触发 transition 的 <code>beforeEnter</code></li><li>触发 指令的 <code>mounted</code>, vnode 的 <code>onVnodeMounted</code>, transition 的 <code>enter</code></li></ol><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> <span class="token function-variable function">mountElement</span> <span class="token operator">=</span> <span class="token punctuation">(</span>
  vnode<span class="token operator">:</span> VNode<span class="token punctuation">,</span>
  container<span class="token operator">:</span> RendererElement<span class="token punctuation">,</span>
  anchor<span class="token operator">:</span> RendererNode <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  parentComponent<span class="token operator">:</span> ComponentInternalInstance <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  parentSuspense<span class="token operator">:</span> SuspenseBoundary <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  isSVG<span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span>
  slotScopeIds<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  optimized<span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">let</span> el<span class="token operator">:</span> RendererElement<span class="token punctuation">;</span>
  <span class="token keyword">let</span> vnodeHook<span class="token operator">:</span> VNodeHook <span class="token operator">|</span> <span class="token keyword">undefined</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> <span class="token punctuation">{</span> type<span class="token punctuation">,</span> props<span class="token punctuation">,</span> shapeFlag<span class="token punctuation">,</span> transition<span class="token punctuation">,</span> dirs <span class="token punctuation">}</span> <span class="token operator">=</span> vnode<span class="token punctuation">;</span>

  el <span class="token operator">=</span> vnode<span class="token punctuation">.</span>el <span class="token operator">=</span> <span class="token function">hostCreateElement</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// children 要么是字符串 要么是 数组</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">TEXT_CHILDREN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 插入文本</span>
    <span class="token function">hostSetElementText</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">ARRAY_CHILDREN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// mountChildren 遍历挂载</span>
    <span class="token function">mountChildren</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 触发 指令 created 钩子</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>dirs<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">invokeDirectiveHook</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span> <span class="token string">&#39;created&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 初始化 props</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">const</span> key <span class="token keyword">in</span> props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>key <span class="token operator">!==</span> <span class="token string">&#39;value&#39;</span> <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span><span class="token function">isReservedProp</span><span class="token punctuation">(</span>key<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">hostPatchProp</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token comment">// 这里有个 边界case</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token string">&#39;value&#39;</span> <span class="token keyword">in</span> props<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">hostPatchProp</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> <span class="token string">&#39;value&#39;</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> props<span class="token punctuation">.</span>value<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token comment">// 调用 onVnodeBeforeMount</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>vnodeHook <span class="token operator">=</span> props<span class="token punctuation">.</span>onVnodeBeforeMount<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">invokeVNodeHook</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 调用 beforeMount</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>dirs<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">invokeDirectiveHook</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span> <span class="token string">&#39;beforeMount&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// 是否需要 调用 transform hook</span>
  <span class="token keyword">const</span> needCallTransitionHooks <span class="token operator">=</span>
    <span class="token punctuation">(</span><span class="token operator">!</span>parentSuspense <span class="token operator">||</span> <span class="token punctuation">(</span>parentSuspense <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>parentSuspense<span class="token punctuation">.</span>pendingBranch<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">&amp;&amp;</span>
    transition <span class="token operator">&amp;&amp;</span>
    <span class="token operator">!</span>transition<span class="token punctuation">.</span>persisted<span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>needCallTransitionHooks<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    transition<span class="token operator">!</span><span class="token punctuation">.</span><span class="token function">beforeEnter</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token comment">// 插入 dom</span>
  <span class="token function">hostInsert</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> container<span class="token punctuation">,</span> anchor<span class="token punctuation">)</span><span class="token punctuation">;</span>

  <span class="token comment">// 调用 mounted, onVnodeMounted, transition.enter</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>
    <span class="token punctuation">(</span>vnodeHook <span class="token operator">=</span> props <span class="token operator">&amp;&amp;</span> props<span class="token punctuation">.</span>onVnodeMounted<span class="token punctuation">)</span> <span class="token operator">||</span>
    needCallTransitionHooks <span class="token operator">||</span>
    dirs
  <span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">queuePostRenderEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      vnodeHook <span class="token operator">&amp;&amp;</span> <span class="token function">invokeVNodeHook</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      needCallTransitionHooks <span class="token operator">&amp;&amp;</span> transition<span class="token operator">!</span><span class="token punctuation">.</span><span class="token function">enter</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span><span class="token punctuation">;</span>
      dirs <span class="token operator">&amp;&amp;</span> <span class="token function">invokeDirectiveHook</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span> <span class="token string">&#39;mounted&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span> parentSuspense<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="mountchildren" tabindex="-1"><a class="header-anchor" href="#mountchildren" aria-hidden="true">#</a> mountChildren</h3><p>就是对每个 <code>child</code> 执行 <code>patch</code>,</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> mountChildren<span class="token operator">:</span> <span class="token function-variable function">MountChildrenFn</span> <span class="token operator">=</span> <span class="token punctuation">(</span>
  children<span class="token punctuation">,</span>
  container<span class="token punctuation">,</span>
  anchor<span class="token punctuation">,</span>
  parentComponent<span class="token punctuation">,</span>
  parentSuspense<span class="token punctuation">,</span>
  isSVG<span class="token punctuation">,</span>
  slotScopeIds<span class="token punctuation">,</span>
  optimized<span class="token punctuation">,</span>
  start <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> start<span class="token punctuation">;</span> i <span class="token operator">&lt;</span> children<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> child <span class="token operator">=</span> children<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token function">patch</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> child <span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="patchelement" tabindex="-1"><a class="header-anchor" href="#patchelement" aria-hidden="true">#</a> patchElement</h3><p>对应着 mountElement 做的事来</p><ol><li>将新 vnode 的 el, 指向旧 vnode 的 el</li><li>调用 指令的 <code>beforeUpdate</code> 钩子</li><li>调用 vnode 的 <code>onVnodeBeforeUpdate</code> 钩子</li><li>遍历 patch children</li><li>patch props</li><li>调用 vnode 的 <code>onVnodeUpdated</code>, 指令的 <code>updated</code></li></ol><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> <span class="token function-variable function">patchElement</span> <span class="token operator">=</span> <span class="token punctuation">(</span>
  n1<span class="token operator">:</span> VNode<span class="token punctuation">,</span>
  n2<span class="token operator">:</span> VNode<span class="token punctuation">,</span>
  parentComponent<span class="token operator">:</span> ComponentInternalInstance <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  parentSuspense<span class="token operator">:</span> SuspenseBoundary <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  isSVG<span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span>
  slotScopeIds<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">,</span>
  optimized<span class="token operator">:</span> <span class="token builtin">boolean</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> el <span class="token operator">=</span> <span class="token punctuation">(</span>n2<span class="token punctuation">.</span>el <span class="token operator">=</span> n1<span class="token punctuation">.</span>el<span class="token operator">!</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">let</span> <span class="token punctuation">{</span> patchFlag<span class="token punctuation">,</span> dynamicChildren<span class="token punctuation">,</span> dirs <span class="token punctuation">}</span> <span class="token operator">=</span> n2<span class="token punctuation">;</span>
  patchFlag <span class="token operator">|=</span> n1<span class="token punctuation">.</span>patchFlag <span class="token operator">&amp;</span> PatchFlags<span class="token punctuation">.</span><span class="token constant">FULL_PROPS</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> oldProps <span class="token operator">=</span> n1<span class="token punctuation">.</span>props <span class="token operator">||</span> <span class="token constant">EMPTY_OBJ</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> newProps <span class="token operator">=</span> n2<span class="token punctuation">.</span>props <span class="token operator">||</span> <span class="token constant">EMPTY_OBJ</span><span class="token punctuation">;</span>
  <span class="token keyword">let</span> vnodeHook<span class="token operator">:</span> VNodeHook <span class="token operator">|</span> <span class="token keyword">undefined</span> <span class="token operator">|</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>vnodeHook <span class="token operator">=</span> newProps<span class="token punctuation">.</span>onVnodeBeforeUpdate<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">invokeVNodeHook</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>dirs<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">invokeDirectiveHook</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span> <span class="token string">&#39;beforeUpdate&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">const</span> areChildrenSVG <span class="token operator">=</span> isSVG <span class="token operator">&amp;&amp;</span> n2<span class="token punctuation">.</span>type <span class="token operator">!==</span> <span class="token string">&#39;foreignObject&#39;</span><span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>dynamicChildren<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 处理动态子节点数组</span>
    <span class="token function">patchBlockChildren</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>optimized<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// patch 所有的子节点</span>
    <span class="token function">patchChildren</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span>patchFlag <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>patchFlag <span class="token operator">&amp;</span> PatchFlags<span class="token punctuation">.</span><span class="token constant">FULL_PROPS</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// style class props 都需要patch</span>
      <span class="token function">patchProps</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
      <span class="token comment">// patch class</span>
      <span class="token class-name"><span class="token keyword">if</span></span> <span class="token punctuation">(</span>patchFlag <span class="token operator">&amp;</span> PatchFlags<span class="token punctuation">.</span><span class="token constant">CLASS</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>oldProps<span class="token punctuation">.</span>class <span class="token operator">!==</span> newProps<span class="token punctuation">.</span>class<span class="token punctuation">)</span> <span class="token punctuation">{</span>
          <span class="token function">hostPatchProp</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> <span class="token string">&#39;class&#39;</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> newProps<span class="token punctuation">.</span>class<span class="token punctuation">,</span> isSVG<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>

      <span class="token comment">// patch style</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>patchFlag <span class="token operator">&amp;</span> PatchFlags<span class="token punctuation">.</span><span class="token constant">STYLE</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">hostPatchProp</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> <span class="token string">&#39;style&#39;</span><span class="token punctuation">,</span> oldProps<span class="token punctuation">.</span>style<span class="token punctuation">,</span> newProps<span class="token punctuation">.</span>style<span class="token punctuation">,</span> isSVG<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>

      <span class="token comment">// patch props</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>patchFlag <span class="token operator">&amp;</span> PatchFlags<span class="token punctuation">.</span><span class="token constant">PROPS</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">const</span> propsToUpdate <span class="token operator">=</span> n2<span class="token punctuation">.</span>dynamicProps<span class="token operator">!</span><span class="token punctuation">;</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">let</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> propsToUpdate<span class="token punctuation">.</span>length<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
          <span class="token keyword">const</span> key <span class="token operator">=</span> propsToUpdate<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span>
          <span class="token comment">// value是强制patch</span>
          <span class="token keyword">if</span> <span class="token punctuation">(</span>next <span class="token operator">!==</span> prev <span class="token operator">||</span> key <span class="token operator">===</span> <span class="token string">&#39;value&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">hostPatchProp</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// children 是文本</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>patchFlag <span class="token operator">&amp;</span> PatchFlags<span class="token punctuation">.</span><span class="token constant">TEXT</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>n1<span class="token punctuation">.</span>children <span class="token operator">!==</span> n2<span class="token punctuation">.</span>children<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">hostSetElementText</span><span class="token punctuation">(</span>el<span class="token punctuation">,</span> n2<span class="token punctuation">.</span>children <span class="token keyword">as</span> <span class="token builtin">string</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>optimized <span class="token operator">&amp;&amp;</span> dynamicChildren <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// patch children</span>
    <span class="token function">patchProps</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>vnodeHook <span class="token operator">=</span> newProps<span class="token punctuation">.</span>onVnodeUpdated<span class="token punctuation">)</span> <span class="token operator">||</span> dirs<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">queuePostRenderEffect</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      vnodeHook <span class="token operator">&amp;&amp;</span> <span class="token function">invokeVNodeHook</span><span class="token punctuation">(</span>vnodeHook<span class="token punctuation">,</span> parentComponent<span class="token punctuation">,</span> n2<span class="token punctuation">,</span> n1<span class="token punctuation">)</span><span class="token punctuation">;</span>
      dirs <span class="token operator">&amp;&amp;</span> <span class="token function">invokeDirectiveHook</span><span class="token punctuation">(</span>n2<span class="token punctuation">,</span> n1<span class="token punctuation">,</span> parentComponent<span class="token punctuation">,</span> <span class="token string">&#39;updated&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span> parentSuspense<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="patchchildren" tabindex="-1"><a class="header-anchor" href="#patchchildren" aria-hidden="true">#</a> patchChildren</h3><div class="hint-container info"><p class="hint-container-title">相关信息</p><p>首先我们要明确, <code>children</code> 的 有哪几类:</p><ol><li>text</li><li>array</li><li>null</li></ol><p>两个 vnode 的 children 是不是一共就有 <code>9</code> 种可能</p></div><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token keyword">const</span> patchChildren<span class="token operator">:</span> <span class="token function-variable function">PatchChildrenFn</span> <span class="token operator">=</span> <span class="token punctuation">(</span>
  n1<span class="token punctuation">,</span>
  n2<span class="token punctuation">,</span>
  container<span class="token punctuation">,</span>
  anchor<span class="token punctuation">,</span>
  parentComponent<span class="token punctuation">,</span>
  parentSuspense<span class="token punctuation">,</span>
  isSVG<span class="token punctuation">,</span>
  slotScopeIds<span class="token punctuation">,</span>
  optimized <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> c1 <span class="token operator">=</span> n1 <span class="token operator">&amp;&amp;</span> n1<span class="token punctuation">.</span>children<span class="token punctuation">;</span>
  <span class="token keyword">const</span> prevShapeFlag <span class="token operator">=</span> n1 <span class="token operator">?</span> n1<span class="token punctuation">.</span>shapeFlag <span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">;</span>
  <span class="token keyword">const</span> c2 <span class="token operator">=</span> n2<span class="token punctuation">.</span>children<span class="token punctuation">;</span>

  <span class="token keyword">const</span> <span class="token punctuation">{</span> patchFlag<span class="token punctuation">,</span> shapeFlag <span class="token punctuation">}</span> <span class="token operator">=</span> n2<span class="token punctuation">;</span>

  <span class="token comment">// 新的是 text</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">TEXT_CHILDREN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 新的是text 但 旧的是 数组</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prevShapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">ARRAY_CHILDREN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// 我们直接卸载 旧的children</span>
      <span class="token function">unmountChildren</span><span class="token punctuation">(</span>c1 <span class="token keyword">as</span> VNode<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> parentComponent<span class="token punctuation">,</span> parentSuspense<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token comment">// 旧的 是text, 但是不与 新的值相同</span>
    <span class="token comment">// 旧的 是 null</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>c2 <span class="token operator">!==</span> c1<span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token function">hostSetElementText</span><span class="token punctuation">(</span>container<span class="token punctuation">,</span> c2 <span class="token keyword">as</span> <span class="token builtin">string</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
    <span class="token comment">// 旧的是 array</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>prevShapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">ARRAY_CHILDREN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token comment">// 新的也是 array</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">ARRAY_CHILDREN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// patchchildren</span>
        <span class="token function">patchKeyedChildren</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 没有新的 直接卸载</span>
        <span class="token function">unmountChildren</span><span class="token punctuation">(</span>c1 <span class="token keyword">as</span> VNode<span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span> parentComponent<span class="token punctuation">,</span> parentSuspense<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
      <span class="token comment">// 旧的 text / null</span>
      <span class="token comment">// 新的 array / null</span>

      <span class="token comment">//  旧的是文本, 卸载</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>prevShapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">TEXT_CHILDREN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">hostSetElementText</span><span class="token punctuation">(</span>container<span class="token punctuation">,</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
      <span class="token comment">// 挂载新的</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>shapeFlag <span class="token operator">&amp;</span> ShapeFlags<span class="token punctuation">.</span><span class="token constant">ARRAY_CHILDREN</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">mountChildren</span><span class="token punctuation">(</span><span class="token doc-comment comment">/** */</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,56),o=[e];function c(l,i){return s(),a("div",null,o)}const k=n(t,[["render",c],["__file","render-flow.html.vue"]]);export{k as default};
