
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const routesArray = readable([
        {
            name: 'Home',
            icon: '',
            path: '/'
        },
        {
            name: 'Word',
            icon: `<i class="fas fa-file-word"></i>`,
            path: 'word'
        },
        {   
            name: 'Video',
            icon: `<i class="fas fa-file-video"></i>`,
            path: 'video'
        },
        {
            name: 'Image',
            icon: `<i class="fas fa-file-image"></i>`,
            path: 'image'
        },
        {
            name: 'Audio',
            icon: `<i class="fas fa-file-audio"></i>`,
            path: 'audio'
        },
        {
            name: 'Payment',
            icon: `<i class="fas fa-file-invoice-dollar"></i>`,
            path: 'payment'
        },
        // {   
        //     name: 'Codes',
        //     icon: `<i class="fas fa-file-code"></i>`,
        //     path: 'codes'
        // },
        {
            name: 'Skills',
            icon: `<i style="font-size:24px;" class="fas fa-chart-pie"></i>`,
            path: 'skills'
        },
        {
            name: 'Leads',
            icon: '<i style="font-size:22px;" class="fas fa-leaf"></i>',
            path: 'leads'
        },
        {
            name: 'Quest',
            icon: '<i style="font-size:22px;" class="fas fa-scroll"></i>',
            path: 'quest'
        },
        {
            name: 'Faq',
            icon: '<i class="fas fa-clipboard-list"></i>',
            path: 'faq'
        },
        {
            name: 'Client Doubt',
            icon: '<i class="fas fa-question"></i>',
            path: 'client'
        },
        {
            name: 'Collab',
            icon: '<i style="font-size:22px;" class="fas fa-coffee"></i>',
            path: 'collab'
        },
        {
            name: 'Works',
            icon: '<i style="font-size:25px;" class="fas fa-briefcase"></i>',
            path: 'work'
        },
        {
            name: 'Client Leads',
            icon: '<i style="font-size:22px;" class="fas fa-address-card"></i>',
            path: 'clientl'
        },
        {
            name: 'Client cases',
            icon: '<i class="fas fa-building"></i>',
            path: 'cases'
        }
    ]);

    /* src\layout\Header.svelte generated by Svelte v3.46.2 */

    const file$k = "src\\layout\\Header.svelte";

    function create_fragment$m(ctx) {
    	let link;
    	let title_value;
    	let t;
    	let header;
    	let i;
    	document.title = title_value = "\r\n       " + /*title*/ ctx[0] + "\r\n    ";

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			header = element("header");
    			i = element("i");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.0/css/all.min.css");
    			attr_dev(link, "integrity", "sha512-BnbUDfEUfV0Slx6TunuB042k9tuKe3xrD6q4mg5Ed72LTgzDIcLPxg6yI2gcMFRyomt+yJJxE+zJwNmxki6/RA==");
    			attr_dev(link, "crossorigin", "anonymous");
    			attr_dev(link, "referrerpolicy", "no-referrer");
    			add_location(link, file$k, 1, 4, 19);
    			attr_dev(i, "class", "fas fa-bell-slash");
    			add_location(i, file$k, 8, 4, 364);
    			add_location(header, file$k, 7, 0, 350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, i);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1 && title_value !== (title_value = "\r\n       " + /*title*/ ctx[0] + "\r\n    ")) {
    				document.title = title_value;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { title } = $$props;
    	const writable_props = ['title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ title });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<Header> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Sidebar.svelte generated by Svelte v3.46.2 */

    const file$j = "src\\layout\\Sidebar.svelte";

    function get_each_context$e(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (11:8) {#each sidebar_items as item}
    function create_each_block$e(ctx) {
    	let li;
    	let a;
    	let p;
    	let t0;
    	let t1_value = /*item*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let html_tag;
    	let raw_value = /*item*/ ctx[1].icon + "";
    	let a_href_value;
    	let t3;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			p = element("p");
    			t0 = text("Editor ");
    			t1 = text(t1_value);
    			t2 = space();
    			html_tag = new HtmlTag();
    			t3 = space();
    			attr_dev(p, "class", "unview");
    			add_location(p, file$j, 14, 20, 341);
    			html_tag.a = null;
    			attr_dev(a, "class", "editor");
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[1].path);
    			add_location(a, file$j, 13, 16, 284);
    			attr_dev(li, "class", "item");
    			add_location(li, file$j, 12, 12, 249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(a, t2);
    			html_tag.m(raw_value, a);
    			append_dev(li, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sidebar_items*/ 1 && t1_value !== (t1_value = /*item*/ ctx[1].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*sidebar_items*/ 1 && raw_value !== (raw_value = /*item*/ ctx[1].icon + "")) html_tag.p(raw_value);

    			if (dirty & /*sidebar_items*/ 1 && a_href_value !== (a_href_value = /*item*/ ctx[1].path)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$e.name,
    		type: "each",
    		source: "(11:8) {#each sidebar_items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let aside;
    	let div;
    	let a;
    	let img;
    	let img_src_value;
    	let t;
    	let ul;
    	let each_value = /*sidebar_items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$e(get_each_context$e(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			div = element("div");
    			a = element("a");
    			img = element("img");
    			t = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(img, "class", "image-person");
    			if (!src_url_equal(img.src, img_src_value = src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "profile");
    			add_location(img, file$j, 4, 12, 75);
    			attr_dev(a, "href", "/user");
    			add_location(a, file$j, 3, 8, 45);
    			attr_dev(div, "class", "person");
    			add_location(div, file$j, 2, 4, 15);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$j, 8, 4, 155);
    			add_location(aside, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, div);
    			append_dev(div, a);
    			append_dev(a, img);
    			append_dev(aside, t);
    			append_dev(aside, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*sidebar_items*/ 1) {
    				each_value = /*sidebar_items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$e(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$e(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const src = '/images/profile.png';

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sidebar', slots, []);
    	let { sidebar_items } = $$props;
    	const writable_props = ['sidebar_items'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('sidebar_items' in $$props) $$invalidate(0, sidebar_items = $$props.sidebar_items);
    	};

    	$$self.$capture_state = () => ({ sidebar_items, src });

    	$$self.$inject_state = $$props => {
    		if ('sidebar_items' in $$props) $$invalidate(0, sidebar_items = $$props.sidebar_items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sidebar_items];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { sidebar_items: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*sidebar_items*/ ctx[0] === undefined && !('sidebar_items' in props)) {
    			console.warn("<Sidebar> was created without expected prop 'sidebar_items'");
    		}
    	}

    	get sidebar_items() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sidebar_items(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    //export const urlEnv = readable('http://localhost:5000');
    const urlEnv = readable('https://squadops.herokuapp.com');

    let urlDev;

    const startRestLoading = () => {
        document.body.classList.add('loading');
        let startDance = document.createElement('div');
        let startDanceExists = document.querySelector('.startdance');

        if(startDanceExists != undefined || startDanceExists != null) return;

        startDance.setAttribute('class', 'startdance active');

        startDance.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="100%" height="100%" viewBox="0 0 567.000000 681.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(100,555) scale(0.100000,-0.100000)" fill="currentColor" stroke="none"><path class="hair" d="M2590 6269 c-441 -44 -841 -237 -1152 -557 l-88 -89 -52 18 c-143 49 -216 -4 -316 -226 l-40 -90 -93 0 c-138 -1 -202 -34 -235 -122 -32 -84 -5 -354 46 -454 32 -62 87 -116 138 -136 95 -37 253 -11 376 61 39 23 44 30 51 73 9 65 36 196 42 205 2 5 13 3 24 -3 28 -15 146 17 305 82 144 59 561 267 814 406 173 95 226 114 420 152 371 71 865 60 1248 -30 78 -18 112 -18 86 -1 -5 4 -18 30 -28 57 -102 280 -373 492 -746 585 -280 70 -554 93 -800 69z"/><path class="side-hair" d="M2405 5372 c-554 -302 -980 -490 -1089 -480 -34 3 -36 -3 -61 -142 -48 -273 25 -902 201 -1724 49 -230 52 -240 69 -226 25 21 117 171 142 232 13 32 30 84 38 114 l14 56 -47 48 c-58 59 -142 198 -182 302 -55 142 -65 193 -65 328 0 117 2 129 29 188 78 170 304 278 440 212 61 -29 127 -105 162 -185 l28 -65 184 0 c172 0 184 1 177 18 -23 53 -14 538 11 639 5 16 39 40 129 87 137 71 232 131 314 196 l55 43 -50 17 c-155 50 -269 183 -311 361 l-18 74 -170 -93z"/><path class="left-eyebrow" d="M3625 4735 c-33 -7 -91 -25 -130 -39 -70 -27 -209 -105 -201 -113 2 -2 28 3 57 11 29 9 100 21 158 28 91 10 120 9 206 -6 121 -20 252 -80 333 -152 29 -26 57 -43 61 -38 4 5 29 37 54 71 l47 61 -48 42 c-63 55 -191 117 -277 135 -85 18 -180 18 -260 0z"/><path class="right-eyebrow" d="M4482 4597 c-7 -18 -29 -53 -49 -76 -31 -37 -33 -43 -15 -37 12 3 32 9 45 12 43 12 59 35 52 74 -11 57 -20 64 -33 27z"/><path class="beard" d="M2087 3908 c-9 -123 -59 -227 -130 -270 l-38 -23 4 -515 c4 -542 8 -603 58 -843 68 -329 210 -632 416 -887 143 -177 401 -402 635 -554 l87 -57 108 11 c699 70 1121 261 1383 628 71 99 175 307 216 432 15 47 32 87 36 88 5 2 -19 17 -52 33 -122 57 -229 202 -274 369 l-18 65 -104 -51 c-229 -113 -431 -132 -594 -56 -70 32 -175 137 -216 217 -44 83 -79 185 -99 287 l-17 85 -76 7 c-548 50 -900 430 -958 1034 l-7 72 -177 0 -177 0 -6 -72z"/><path class="mustache" d="M4388 3426 c-121 -50 -241 -178 -351 -376 -65 -118 -59 -119 47 -15 152 150 309 228 487 242 44 3 76 9 70 12 -6 4 -26 41 -45 84 l-35 77 -58 0 c-37 0 -78 -9 -115 -24z"/><path class="goatee" d="M4480 2872 c0 -22 -61 -80 -103 -97 l-42 -17 65 -25 c36 -14 80 -27 99 -30 32 -6 34 -5 28 18 -3 13 -11 51 -18 84 -11 55 -29 96 -29 67z"/></g></svg>`;

        document.body.append(startDance);

        //PREVENTS STOP NEVER CALLS
        // if(startDance != undefined){
        //     setTimeout(() => {
        //         startDance.remove();
        //     }, 1800);
        // }

    };

    const stopRestLoading = () => {
        document.body.classList.remove('loading');
        let startDanceExists = document.querySelector('.startdance');

        if(startDanceExists != undefined){
            startDanceExists.classList.add('inactive');
            setTimeout(() => {
                startDanceExists.remove();
            }, 1500);
        }

    };

    const setNewNotification = (message, propClass = null) => {
        let divNotification = document.createElement('div');
        let progressBar = document.createElement('progress');
        let notificationController = document.querySelector('.notifications-controller');
        // let notificationClassExists = document.querySelector('.notification');
        // if(notificationClassExists != undefined || notificationClassExists != null) return;
        propClass != null ? divNotification.setAttribute('class', `notification ${propClass}`) : divNotification.setAttribute('class', 'notification');

        progressBar.setAttribute('max', '100');
        progressBar.setAttribute('value', '100');

        divNotification.innerHTML = ` <p> ${message} </p> `;
        divNotification.append(progressBar);
        notificationController.append(divNotification);

        let clearProgress = setInterval(function() {

            progressBar.value = progressBar.value - 1;

            if (progressBar.value == 0) {
                clearInterval(clearProgress);
                divNotification.classList.add('hide');
                setTimeout(() => {
                      divNotification.remove();
                }, 1000);
            }
        }, 25);

    };

    const setCookie = (cname, cvalue, expiring) => {
        const d = new Date();
        d.setTime(d.getTime() + (expiring*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires;
    };

    const getCookie = (cname) => {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    };

    const checkCookie = (cname) => {
        getCookie(cname);
    };

    urlEnv.subscribe(url => urlDev = url);

    const checkLogged = async () => {
        let Token = getCookie('token');
        Token == '' ? window.location.href = '/unauthorized' : '' ;
    };

    const startARest = async (url, meth, json, customResponse = null, mult = true, file, Token = undefined) => {
        const urls = [
            `${urlDev}${url}`
        ];

        startRestLoading();

        let fetchHeader;
        let fetchType;
        let tken;
     
        Token != undefined ? tken = `Bearer ${Token}` : undefined;

        if(meth == 'POST' || meth == 'PUT'){
            if(mult){
                fetchHeader = {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': tken
                };
        
                fetchType = {
                    method: meth,
                    body: JSON.stringify(json),
                    headers: fetchHeader
                };
            } else {
                const formData = new FormData();
                formData.append(file, json);

                fetchType = {
                    method: meth,
                    body: formData
                };
            }

            let getReturn = await callFetch(urls, fetchType, customResponse);

            return getReturn;

        } else if (meth == 'DELETE'){

            fetchType = {
                method: meth
            };

            let getReturn = await callFetch(urls, fetchType, customResponse);
            return getReturn;

        } else {

            fetchHeader = {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': tken
            };

            fetchType = {
                method: meth,
                headers: new Headers(fetchHeader)
            };

            let getReturn = await callFetch(urls, fetchType, customResponse);

            return getReturn;

        }
    };

    const callFetch = async (urls, fetchType, customResponse = undefined) => {
        try {
            let res = await Promise.all(urls.map(result => fetch(result, fetchType).then(
                    treatResult => {
                        if(!treatResult.ok){
                            treatResult.json().then(responseError => {
                                if(typeof responseError != 'object'){
                                    setNewNotification(responseError, 'error');
                                } else {
                                    setNewNotification(responseError.error, 'error');

                                    return responseError;
                                }
                            });
                        } else if (treatResult == 401){
                            return {error: 'Unauthorized'};
                        } else {
                            return treatResult;
                        }
                    }
                )
            ));


            stopRestLoading();
            
            let resJson = await Promise.all(res.map(result => result.json()));
            resJson = resJson.map(result => result);

            (customResponse != undefined && customResponse != true && customResponse != null) ? setNewNotification(customResponse, 'success') : '';

            return resJson;

        }
        catch(err){

            stopRestLoading();

            console.warn(err);
            //setNewNotification(err, 'error');
        }
    };

    /* src\layout\Dash.svelte generated by Svelte v3.46.2 */

    const file$i = "src\\layout\\Dash.svelte";

    // (8:4) {:else}
    function create_else_block_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "frost-chart");
    			add_location(div, file$i, 8, 8, 216);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(8:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (6:4) {#if lazy == true}
    function create_if_block_2$f(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "frost-unload");
    			add_location(div, file$i, 6, 8, 161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$f.name,
    		type: "if",
    		source: "(6:4) {#if lazy == true}",
    		ctx
    	});

    	return block;
    }

    // (17:12) {#if getTotal != undefined}
    function create_if_block$h(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*getTotal*/ ctx[0] != 0) return create_if_block_1$f;
    		return create_else_block$f;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$h.name,
    		type: "if",
    		source: "(17:12) {#if getTotal != undefined}",
    		ctx
    	});

    	return block;
    }

    // (22:16) {:else}
    function create_else_block$f(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Sem doações ;(";
    			add_location(span, file$i, 22, 20, 656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$f.name,
    		type: "else",
    		source: "(22:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:16) {#if getTotal != 0}
    function create_if_block_1$f(ctx) {
    	let span;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("R$ ");
    			t1 = text(/*getTotal*/ ctx[0]);
    			add_location(span, file$i, 18, 20, 535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getTotal*/ 1) set_data_dev(t1, /*getTotal*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$f.name,
    		type: "if",
    		source: "(18:16) {#if getTotal != 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let script;
    	let script_src_value;
    	let t0;
    	let div3;
    	let t1;
    	let div2;
    	let div0;
    	let t3;
    	let div1;
    	let i;
    	let t4;

    	function select_block_type(ctx, dirty) {
    		if (/*lazy*/ ctx[1] == true) return create_if_block_2$f;
    		return create_else_block_1$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*getTotal*/ ctx[0] != undefined && create_if_block$h(ctx);

    	const block = {
    		c: function create() {
    			script = element("script");
    			t0 = space();
    			div3 = element("div");
    			if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "TOTAL DE DOAÇÕES";
    			t3 = space();
    			div1 = element("div");
    			i = element("i");
    			t4 = space();
    			if (if_block1) if_block1.c();
    			if (!src_url_equal(script.src, script_src_value = "https://unpkg.com/frappe-charts@latest")) attr_dev(script, "src", script_src_value);
    			add_location(script, file$i, 1, 4, 19);
    			attr_dev(div0, "class", "title");
    			add_location(div0, file$i, 11, 8, 292);
    			attr_dev(i, "class", "fas fa-gift");
    			add_location(i, file$i, 15, 12, 408);
    			attr_dev(div1, "class", "donate-result");
    			add_location(div1, file$i, 14, 8, 367);
    			attr_dev(div2, "class", "donates");
    			add_location(div2, file$i, 10, 4, 261);
    			attr_dev(div3, "class", "content dash");
    			add_location(div3, file$i, 4, 0, 101);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, script);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			if_block0.m(div3, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, i);
    			append_dev(div1, t4);
    			if (if_block1) if_block1.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div3, t1);
    				}
    			}

    			if (/*getTotal*/ ctx[0] != undefined) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$h(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dash', slots, []);
    	let titles = [];
    	let videos = [];
    	let images = [];
    	let audios = [];
    	let donate = [];
    	let totalMedia = [];
    	let totalAmount = [];
    	let getTotal;
    	let getTotalMedias;
    	let Token = getCookie('token');
    	let lazy = true;

    	onMount(async () => {
    		checkLogged();
    		feedUpdate();
    	});

    	const feedUpdate = async () => {
    		startRestLoading();
    		const titlesList = await startARest('/title', 'GET', null, true, null, null, Token);
    		const videoList = await startARest('/video/list', 'GET', null);
    		const imagesList = await startARest('/media/list', 'GET', null);
    		const audiosList = await startARest('/audio/list', 'GET', null);
    		const donateList = await startARest('/history/payments', 'GET', null);

    		titlesList != undefined
    		? titles = titlesList[0].getTitles
    		: titles = [];

    		videoList != undefined
    		? videos = videoList[0].listStream
    		: videos = [];

    		imagesList != undefined
    		? images = imagesList[0].listStream
    		: images = [];

    		audiosList != undefined
    		? audios = audiosList[0].listStream
    		: audios = [];

    		donateList != undefined
    		? donate = donateList[0].getPayments
    		: donate = [];

    		if (donate.length > 0) {
    			donate.map(item => {
    				if (item.status == 'approved') {
    					totalAmount.push(Number(item.transaction_amount));
    				}
    			});

    			$$invalidate(0, getTotal = totalAmount.reduce((previousValue, currentValue) => previousValue + currentValue, 0));
    			totalMedia.push(titles.length, videos.length, images.length, audios.length, donate.length);
    			getTotalMedias = totalMedia.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    		} else {
    			getTotalMedias = 20;
    			$$invalidate(0, getTotal = 0);
    			donate = 0;
    		}

    		$$invalidate(1, lazy = false);

    		setTimeout(
    			() => {
    				initializeRemarkable(titles, videos, images, audios, donate, getTotalMedias);
    			},
    			550
    		);

    		setNewNotification('Dados carregados com sucesso!', 'success');
    	};

    	const initializeRemarkable = async (titles, videos, images, audios, donate, total) => {
    		new frappe.Chart("#frost-chart",
    		{
    				data: {
    					labels: ["Títulos", "Vídeos", "Imagens", "Audios", "Doações"],
    					datasets: [
    						{
    							values: [
    								titles.length,
    								videos.length - 1,
    								images.length - 1,
    								audios.length - 1,
    								donate.length
    							]
    						}
    					],
    					yMarkers: [
    						{
    							label: " ",
    							value: total * 1.15,
    							options: { labelPos: 'left' }, // default: 'right'
    							
    						}
    					]
    				},
    				lineOptions: {
    					regionFill: 1, // default: 0
    					
    				},
    				title: "Medias cadastradas",
    				type: 'line', // or 'bar', 'line', 'pie', 'percentage'
    				height: 300,
    				colors: ['purple', '#ffa3ef', 'light-blue'],
    				tooltipOptions: {
    					formatTooltipX: d => (d + '').toUpperCase(),
    					formatTooltipY: d => d + ' '
    				}
    			});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dash> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		setNewNotification,
    		startRestLoading,
    		getCookie,
    		checkLogged,
    		titles,
    		videos,
    		images,
    		audios,
    		donate,
    		totalMedia,
    		totalAmount,
    		getTotal,
    		getTotalMedias,
    		Token,
    		lazy,
    		feedUpdate,
    		initializeRemarkable
    	});

    	$$self.$inject_state = $$props => {
    		if ('titles' in $$props) titles = $$props.titles;
    		if ('videos' in $$props) videos = $$props.videos;
    		if ('images' in $$props) images = $$props.images;
    		if ('audios' in $$props) audios = $$props.audios;
    		if ('donate' in $$props) donate = $$props.donate;
    		if ('totalMedia' in $$props) totalMedia = $$props.totalMedia;
    		if ('totalAmount' in $$props) totalAmount = $$props.totalAmount;
    		if ('getTotal' in $$props) $$invalidate(0, getTotal = $$props.getTotal);
    		if ('getTotalMedias' in $$props) getTotalMedias = $$props.getTotalMedias;
    		if ('Token' in $$props) Token = $$props.Token;
    		if ('lazy' in $$props) $$invalidate(1, lazy = $$props.lazy);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [getTotal, lazy];
    }

    class Dash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dash",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\layout\NotFound.svelte generated by Svelte v3.46.2 */

    function create_fragment$j(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("404");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotFound', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\layout\Checkout.svelte generated by Svelte v3.46.2 */

    const { console: console_1$1, document: document_1$2 } = globals;
    const file$h = "src\\layout\\Checkout.svelte";

    // (68:8) {#if pixResponse != undefined}
    function create_if_block$g(ctx) {
    	let span0;
    	let t0;
    	let t1_value = /*pixResponse*/ ctx[3].total_paid_amount + "";
    	let t1;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let span1;
    	let t4_value = /*pixResponse*/ ctx[3].qr_code + "";
    	let t4;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = text("Pix total: R$ ");
    			t1 = text(t1_value);
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			span1 = element("span");
    			t4 = text(t4_value);
    			add_location(span0, file$h, 68, 13, 3341);
    			set_style(img, "width", "250px");
    			set_style(img, "margin", "25px");
    			if (!src_url_equal(img.src, img_src_value = "data:image/jpeg;charset=utf-8;base64, " + /*pixResponse*/ ctx[3].qr_code_base64)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$h, 69, 13, 3416);
    			add_location(span1, file$h, 70, 13, 3552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pixResponse*/ 8 && t1_value !== (t1_value = /*pixResponse*/ ctx[3].total_paid_amount + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*pixResponse*/ 8 && !src_url_equal(img.src, img_src_value = "data:image/jpeg;charset=utf-8;base64, " + /*pixResponse*/ ctx[3].qr_code_base64)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*pixResponse*/ 8 && t4_value !== (t4_value = /*pixResponse*/ ctx[3].qr_code + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$g.name,
    		type: "if",
    		source: "(68:8) {#if pixResponse != undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let script;
    	let script_src_value;
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let div12;
    	let form;
    	let input0;
    	let t3;
    	let button0;
    	let t5;
    	let input1;
    	let t6;
    	let input2;
    	let t7;
    	let input3;
    	let t8;
    	let input4;
    	let t9;
    	let input5;
    	let t10;
    	let input6;
    	let t11;
    	let select0;
    	let t12;
    	let select1;
    	let t13;
    	let input7;
    	let t14;
    	let select2;
    	let t15;
    	let button1;
    	let t17;
    	let progress;
    	let t19;
    	let div10;
    	let h3;
    	let t21;
    	let div2;
    	let div0;
    	let input8;
    	let t22;
    	let span0;
    	let t23;
    	let div1;
    	let input9;
    	let t24;
    	let span1;
    	let t25;
    	let div4;
    	let div3;
    	let input10;
    	let t26;
    	let span2;
    	let t27;
    	let div7;
    	let div5;
    	let select3;
    	let option0;
    	let option1;
    	let t30;
    	let div6;
    	let input11;
    	let t31;
    	let span3;
    	let t32;
    	let br;
    	let t33;
    	let div9;
    	let div8;
    	let input12;
    	let t34;
    	let input13;
    	let t35;
    	let button2;
    	let t37;
    	let div11;
    	let mounted;
    	let dispose;
    	let if_block = /*pixResponse*/ ctx[3] != undefined && create_if_block$g(ctx);

    	const block = {
    		c: function create() {
    			script = element("script");
    			t0 = space();
    			h1 = element("h1");
    			t1 = text(/*cardType*/ ctx[0]);
    			t2 = space();
    			div12 = element("div");
    			form = element("form");
    			input0 = element("input");
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "Doar";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			input2 = element("input");
    			t7 = space();
    			input3 = element("input");
    			t8 = space();
    			input4 = element("input");
    			t9 = space();
    			input5 = element("input");
    			t10 = space();
    			input6 = element("input");
    			t11 = space();
    			select0 = element("select");
    			t12 = space();
    			select1 = element("select");
    			t13 = space();
    			input7 = element("input");
    			t14 = space();
    			select2 = element("select");
    			t15 = space();
    			button1 = element("button");
    			button1.textContent = "Pay";
    			t17 = space();
    			progress = element("progress");
    			progress.textContent = "loading...";
    			t19 = space();
    			div10 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Buyer Details";
    			t21 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input8 = element("input");
    			t22 = space();
    			span0 = element("span");
    			t23 = space();
    			div1 = element("div");
    			input9 = element("input");
    			t24 = space();
    			span1 = element("span");
    			t25 = space();
    			div4 = element("div");
    			div3 = element("div");
    			input10 = element("input");
    			t26 = space();
    			span2 = element("span");
    			t27 = space();
    			div7 = element("div");
    			div5 = element("div");
    			select3 = element("select");
    			option0 = element("option");
    			option0.textContent = "CPF";
    			option1 = element("option");
    			option1.textContent = "CNPJ";
    			t30 = space();
    			div6 = element("div");
    			input11 = element("input");
    			t31 = space();
    			span3 = element("span");
    			t32 = space();
    			br = element("br");
    			t33 = space();
    			div9 = element("div");
    			div8 = element("div");
    			input12 = element("input");
    			t34 = space();
    			input13 = element("input");
    			t35 = space();
    			button2 = element("button");
    			button2.textContent = "Gerar Pix";
    			t37 = space();
    			div11 = element("div");
    			if (if_block) if_block.c();
    			if (!src_url_equal(script.src, script_src_value = "https://sdk.mercadopago.com/js/v2")) attr_dev(script, "src", script_src_value);
    			add_location(script, file$h, 1, 1, 16);
    			add_location(h1, file$h, 4, 0, 124);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "amount");
    			add_location(input0, file$h, 9, 8, 220);
    			attr_dev(button0, "name", "donate");
    			add_location(button0, file$h, 9, 62, 274);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "cardNumber");
    			attr_dev(input1, "id", "form-checkout__cardNumber");
    			add_location(input1, file$h, 11, 8, 321);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "cardExpirationMonth");
    			attr_dev(input2, "id", "form-checkout__cardExpirationMonth");
    			add_location(input2, file$h, 12, 8, 401);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "cardExpirationYear");
    			attr_dev(input3, "id", "form-checkout__cardExpirationYear");
    			add_location(input3, file$h, 13, 8, 499);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "name", "cardholderName");
    			attr_dev(input4, "id", "form-checkout__cardholderName");
    			add_location(input4, file$h, 14, 8, 595);
    			attr_dev(input5, "type", "email");
    			attr_dev(input5, "name", "cardholderEmail");
    			attr_dev(input5, "id", "form-checkout__cardholderEmail");
    			add_location(input5, file$h, 15, 8, 682);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "name", "securityCode");
    			attr_dev(input6, "id", "form-checkout__securityCode");
    			add_location(input6, file$h, 16, 8, 772);
    			attr_dev(select0, "name", "issuer");
    			attr_dev(select0, "id", "form-checkout__issuer");
    			add_location(select0, file$h, 17, 8, 856);
    			attr_dev(select1, "name", "identificationType");
    			attr_dev(select1, "id", "form-checkout__identificationType");
    			add_location(select1, file$h, 18, 8, 924);
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "name", "identificationNumber");
    			attr_dev(input7, "id", "form-checkout__identificationNumber");
    			add_location(input7, file$h, 19, 8, 1016);
    			attr_dev(select2, "name", "installments");
    			attr_dev(select2, "id", "form-checkout__installments");
    			add_location(select2, file$h, 20, 8, 1115);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "id", "form-checkout__submit");
    			add_location(button1, file$h, 21, 8, 1195);
    			progress.value = "0";
    			attr_dev(progress, "class", "progress-bar");
    			add_location(progress, file$h, 23, 8, 1273);
    			attr_dev(form, "id", "form-checkout");
    			add_location(form, file$h, 7, 4, 182);
    			attr_dev(h3, "class", "title");
    			add_location(h3, file$h, 27, 8, 1394);
    			attr_dev(input8, "id", "form-checkout__payerPixFirstName");
    			attr_dev(input8, "name", "name");
    			attr_dev(input8, "type", "text");
    			attr_dev(input8, "class", "form-control");
    			attr_dev(input8, "placeholder", "First name");
    			add_location(input8, file$h, 30, 16, 1522);
    			add_location(span0, file$h, 31, 16, 1656);
    			attr_dev(div0, "class", "form-group col-sm-6");
    			add_location(div0, file$h, 29, 12, 1471);
    			attr_dev(input9, "id", "form-checkout__payerPixLastName");
    			attr_dev(input9, "name", "lastName");
    			attr_dev(input9, "type", "text");
    			attr_dev(input9, "class", "form-control");
    			attr_dev(input9, "placeholder", "Last name");
    			add_location(input9, file$h, 34, 16, 1754);
    			add_location(span1, file$h, 35, 16, 1890);
    			attr_dev(div1, "class", "form-group col-sm-6");
    			add_location(div1, file$h, 33, 12, 1703);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$h, 28, 8, 1440);
    			attr_dev(input10, "id", "form-checkout__payerPixEmail");
    			attr_dev(input10, "name", "email");
    			attr_dev(input10, "type", "email");
    			attr_dev(input10, "class", "form-control");
    			attr_dev(input10, "placeholder", "E-mail");
    			add_location(input10, file$h, 40, 16, 2026);
    			add_location(span2, file$h, 41, 16, 2154);
    			attr_dev(div3, "class", "form-group col");
    			add_location(div3, file$h, 39, 12, 1980);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$h, 38, 8, 1949);
    			option0.__value = "CPF";
    			option0.value = option0.__value;
    			add_location(option0, file$h, 47, 20, 2414);
    			option1.__value = "CNPJ";
    			option1.value = option1.__value;
    			add_location(option1, file$h, 48, 20, 2468);
    			attr_dev(select3, "id", "form-checkout__identificationPixType");
    			attr_dev(select3, "name", "identificationType");
    			attr_dev(select3, "class", "form-control");
    			add_location(select3, file$h, 46, 16, 2295);
    			attr_dev(div5, "class", "form-group col-sm-5");
    			add_location(div5, file$h, 45, 12, 2244);
    			attr_dev(input11, "id", "form-checkout__identificationPixNumber");
    			attr_dev(input11, "name", "identificationNumber");
    			attr_dev(input11, "type", "text");
    			attr_dev(input11, "class", "form-control");
    			attr_dev(input11, "placeholder", "Identification number");
    			add_location(input11, file$h, 52, 16, 2614);
    			add_location(span3, file$h, 53, 16, 2782);
    			attr_dev(div6, "class", "form-group col-sm-7");
    			add_location(div6, file$h, 51, 12, 2563);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$h, 44, 8, 2213);
    			add_location(br, file$h, 56, 8, 2841);
    			attr_dev(input12, "type", "hidden");
    			attr_dev(input12, "id", "amount");
    			add_location(input12, file$h, 59, 16, 2938);
    			attr_dev(input13, "type", "hidden");
    			attr_dev(input13, "id", "description");
    			add_location(input13, file$h, 60, 16, 3011);
    			attr_dev(button2, "id", "form-checkout__submit");
    			attr_dev(button2, "class", "btn btn-primary btn-block");
    			add_location(button2, file$h, 61, 16, 3094);
    			attr_dev(div8, "class", "form-group col-sm-12");
    			add_location(div8, file$h, 58, 12, 2886);
    			attr_dev(div9, "class", "row");
    			add_location(div9, file$h, 57, 8, 2855);
    			attr_dev(div10, "id", "form-checkout-pix");
    			add_location(div10, file$h, 26, 4, 1356);
    			attr_dev(div11, "class", "pix-payment");
    			add_location(div11, file$h, 66, 4, 3261);
    			attr_dev(div12, "class", "form-controller");
    			add_location(div12, file$h, 6, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1$2.head, script);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, form);
    			append_dev(form, input0);
    			set_input_value(input0, /*amount*/ ctx[1]);
    			append_dev(form, t3);
    			append_dev(form, button0);
    			append_dev(form, t5);
    			append_dev(form, input1);
    			append_dev(form, t6);
    			append_dev(form, input2);
    			append_dev(form, t7);
    			append_dev(form, input3);
    			append_dev(form, t8);
    			append_dev(form, input4);
    			append_dev(form, t9);
    			append_dev(form, input5);
    			append_dev(form, t10);
    			append_dev(form, input6);
    			append_dev(form, t11);
    			append_dev(form, select0);
    			append_dev(form, t12);
    			append_dev(form, select1);
    			append_dev(form, t13);
    			append_dev(form, input7);
    			append_dev(form, t14);
    			append_dev(form, select2);
    			append_dev(form, t15);
    			append_dev(form, button1);
    			append_dev(form, t17);
    			append_dev(form, progress);
    			append_dev(div12, t19);
    			append_dev(div12, div10);
    			append_dev(div10, h3);
    			append_dev(div10, t21);
    			append_dev(div10, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input8);
    			append_dev(div0, t22);
    			append_dev(div0, span0);
    			append_dev(div2, t23);
    			append_dev(div2, div1);
    			append_dev(div1, input9);
    			append_dev(div1, t24);
    			append_dev(div1, span1);
    			append_dev(div10, t25);
    			append_dev(div10, div4);
    			append_dev(div4, div3);
    			append_dev(div3, input10);
    			append_dev(div3, t26);
    			append_dev(div3, span2);
    			append_dev(div10, t27);
    			append_dev(div10, div7);
    			append_dev(div7, div5);
    			append_dev(div5, select3);
    			append_dev(select3, option0);
    			append_dev(select3, option1);
    			append_dev(div7, t30);
    			append_dev(div7, div6);
    			append_dev(div6, input11);
    			append_dev(div6, t31);
    			append_dev(div6, span3);
    			append_dev(div10, t32);
    			append_dev(div10, br);
    			append_dev(div10, t33);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, input12);
    			set_input_value(input12, /*amount*/ ctx[1]);
    			append_dev(div8, t34);
    			append_dev(div8, input13);
    			set_input_value(input13, /*description*/ ctx[2]);
    			append_dev(div8, t35);
    			append_dev(div8, button2);
    			append_dev(div12, t37);
    			append_dev(div12, div11);
    			if (if_block) if_block.m(div11, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(script, "load", /*initializeRemarkable*/ ctx[5], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input12, "input", /*input12_input_handler*/ ctx[7]),
    					listen_dev(input13, "input", /*input13_input_handler*/ ctx[8]),
    					listen_dev(button2, "click", /*paymentPix*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cardType*/ 1) set_data_dev(t1, /*cardType*/ ctx[0]);

    			if (dirty & /*amount*/ 2 && input0.value !== /*amount*/ ctx[1]) {
    				set_input_value(input0, /*amount*/ ctx[1]);
    			}

    			if (dirty & /*amount*/ 2) {
    				set_input_value(input12, /*amount*/ ctx[1]);
    			}

    			if (dirty & /*description*/ 4) {
    				set_input_value(input13, /*description*/ ctx[2]);
    			}

    			if (/*pixResponse*/ ctx[3] != undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$g(ctx);
    					if_block.c();
    					if_block.m(div11, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div12);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Checkout', slots, []);
    	let mppublic;
    	let cardType;
    	let amount = 49;
    	let description = 'Donate pix';
    	let pixResponse;

    	const feedPaymentData = async cardData => {
    		let json = {
    			transactionAmount: cardData.amount,
    			token: cardData.token,
    			installments: cardData.installments,
    			paymentMethodId: cardData.paymentMethodId,
    			issuerId: cardData.issuerId,
    			email: cardData.cardholderEmail,
    			type: cardData.identificationType,
    			number: cardData.identificationNumber
    		};

    		let res = await startARest('/payment', 'POST', json, 'Pagamento enviado');

    		if (res) {
    			setTimeout(
    				() => {
    					json = {}; //console.log('token limpo:', json)
    				},
    				500
    			); //console.log('token limpo:', json)
    		}
    	};

    	const paymentPix = async () => {
    		let getAllInputs = document.querySelectorAll('#form-checkout-pix input');
    		let getType = document.querySelector('#form-checkout__identificationPixType');
    		let email = getAllInputs[2].value;
    		let name = getAllInputs[0].value;
    		let last_name = getAllInputs[1].value;
    		let type = getType.value;
    		let number = getAllInputs[3].value;
    		let transactionAmount = amount;

    		[...getAllInputs].map(pixData => {
    			if (pixData.value == '') {
    				pixData.parentElement.children[1].innerHTML = `<span>O campo ${pixData.name} está vazio véio</span>`;
    			} else {
    				pixData.parentElement.children[1].innerHTML = '';
    			}
    		});

    		let json = {
    			email,
    			name,
    			last_name,
    			type,
    			number,
    			transactionAmount
    		};

    		//console.log(json)
    		if (![email, name, last_name, type, number, transactionAmount].includes('')) {
    			const res = await startARest('/payment/pix', 'POST', json, 'Pix gerado com sucesso!');
    			$$invalidate(3, pixResponse = res[0].makePayment);
    			console.log(pixResponse);
    		}
    	};

    	const initializeRemarkable = async () => {
    		const res = await startARest('/publicmp', 'GET', null);
    		mppublic = res[0].mpublic;

    		//console.log(mppublic)
    		const mp = new MercadoPago(mppublic,
    		{
    				locale: 'pt-BR',
    				advancedFraudPrevention: true
    			});

    		let amnt = document.querySelector('[name="amount"]');
    		let donate = document.querySelector('[name="donate"]');

    		donate.addEventListener('click', e => {
    			e.preventDefault();
    			changeCardForm(amnt.value);
    		});

    		const changeCardForm = pay => {
    			cardForm.unmount();

    			setTimeout(
    				() => {
    					if (pay >= 1 && pay < 5000) {
    						cardForm = mp.cardForm({
    							amount: pay,
    							autoMount: true,
    							processingMode: 'aggregator',
    							form: {
    								id: 'form-checkout',
    								cardholderName: {
    									id: 'form-checkout__cardholderName',
    									placeholder: 'Cardholder name'
    								},
    								cardholderEmail: {
    									id: 'form-checkout__cardholderEmail',
    									placeholder: 'Email'
    								},
    								cardNumber: {
    									id: 'form-checkout__cardNumber',
    									placeholder: 'Card number'
    								},
    								cardExpirationMonth: {
    									id: 'form-checkout__cardExpirationMonth',
    									placeholder: 'MM'
    								},
    								cardExpirationYear: {
    									id: 'form-checkout__cardExpirationYear',
    									placeholder: 'YYYY'
    								},
    								securityCode: {
    									id: 'form-checkout__securityCode',
    									placeholder: 'CVV'
    								},
    								installments: {
    									id: 'form-checkout__installments',
    									placeholder: 'Total installments'
    								},
    								identificationType: {
    									id: 'form-checkout__identificationType',
    									placeholder: 'Document type'
    								},
    								identificationNumber: {
    									id: 'form-checkout__identificationNumber',
    									placeholder: 'Document number'
    								},
    								issuer: {
    									id: 'form-checkout__issuer',
    									placeholder: 'Emissor'
    								}
    							},
    							callbacks: {
    								onFormMounted: error => {
    									if (error) return console.warn('Form Mounted handling error: ', error);
    								}, //console.log('Form mounted')
    								onFormUnmounted: error => {
    									if (error) return console.warn('Form Unmounted handling error: ', error);
    								}, //console.log('Form unmounted')
    								onIdentificationTypesReceived: (error, identificationTypes) => {
    									if (error) return console.warn('identificationTypes handling error: ', error);
    								}, //console.log('Identification types available: ', identificationTypes)
    								onPaymentMethodsReceived: (error, paymentMethods) => {
    									if (error) return console.warn('paymentMethods handling error: ', error);

    									//console.log('Payment Methods available: ', paymentMethods)
    									$$invalidate(0, cardType = paymentMethods[0].name);
    								},
    								onIssuersReceived: (error, issuers) => {
    									if (error) return console.warn('issuers handling error: ', error);
    								}, //console.log('Issuers available: ', issuers)
    								onInstallmentsReceived: (error, installments) => {
    									if (error) return console.warn('installments handling error: ', error);
    								}, //console.log('Installments available: ', installments)
    								onCardTokenReceived: (error, token) => {
    									if (error) return console.warn('Token handling error: ', error);
    								}, //console.log('Token available: ', token)
    								onSubmit: event => {
    									event.preventDefault();
    									const cardData = cardForm.getCardFormData();

    									//console.log('CardForm data available: ', cardData)
    									feedPaymentData(cardData);
    								},
    								onFetching: resource => {
    									//console.log('Fetching resource: ', resource)
    									// Animate progress bar
    									const progressBar = document.querySelector('.progress-bar');

    									progressBar.removeAttribute('value');

    									return () => {
    										progressBar.setAttribute('value', '0');
    									};
    								}
    							}
    						});
    					}
    				},
    				250
    			);
    		};

    		let cardForm = mp.cardForm({
    			amount: '49',
    			autoMount: true,
    			processingMode: 'aggregator',
    			form: {
    				id: 'form-checkout',
    				cardholderName: {
    					id: 'form-checkout__cardholderName',
    					placeholder: 'Cardholder name'
    				},
    				cardholderEmail: {
    					id: 'form-checkout__cardholderEmail',
    					placeholder: 'Email'
    				},
    				cardNumber: {
    					id: 'form-checkout__cardNumber',
    					placeholder: 'Card number'
    				},
    				cardExpirationMonth: {
    					id: 'form-checkout__cardExpirationMonth',
    					placeholder: 'MM'
    				},
    				cardExpirationYear: {
    					id: 'form-checkout__cardExpirationYear',
    					placeholder: 'YYYY'
    				},
    				securityCode: {
    					id: 'form-checkout__securityCode',
    					placeholder: 'CVV'
    				},
    				installments: {
    					id: 'form-checkout__installments',
    					placeholder: 'Total installments'
    				},
    				identificationType: {
    					id: 'form-checkout__identificationType',
    					placeholder: 'Document type'
    				},
    				identificationNumber: {
    					id: 'form-checkout__identificationNumber',
    					placeholder: 'Document number'
    				},
    				issuer: {
    					id: 'form-checkout__issuer',
    					placeholder: 'Emissor'
    				}
    			},
    			callbacks: {
    				onFormMounted: error => {
    					if (error) return console.warn('Form Mounted handling error: ', error);
    				}, //console.log('Form mounted')
    				onFormUnmounted: error => {
    					if (error) return console.warn('Form Unmounted handling error: ', error);
    				}, //console.log('Form unmounted')
    				onIdentificationTypesReceived: (error, identificationTypes) => {
    					if (error) return console.warn('identificationTypes handling error: ', error);
    				}, //console.log('Identification types available: ', identificationTypes)
    				onPaymentMethodsReceived: (error, paymentMethods) => {
    					if (error) return console.warn('paymentMethods handling error: ', error);

    					//console.log('Payment Methods available: ', paymentMethods)
    					$$invalidate(0, cardType = paymentMethods[0].name);
    				},
    				onIssuersReceived: (error, issuers) => {
    					if (error) return console.warn('issuers handling error: ', error);
    				}, //console.log('Issuers available: ', issuers)
    				onInstallmentsReceived: (error, installments) => {
    					if (error) return console.warn('installments handling error: ', error);
    				}, //console.log('Installments available: ', installments)
    				onCardTokenReceived: (error, token) => {
    					if (error) return console.warn('Token handling error: ', error);
    				}, //console.log('Token available: ', token)
    				onSubmit: event => {
    					event.preventDefault();
    					const cardData = cardForm.getCardFormData();

    					//console.log('CardForm data available: ', cardData)
    					feedPaymentData(cardData);
    				},
    				onFetching: resource => {
    					//console.log('Fetching resource: ', resource)
    					// Animate progress bar
    					const progressBar = document.querySelector('.progress-bar');

    					progressBar.removeAttribute('value');

    					return () => {
    						progressBar.setAttribute('value', '0');
    					};
    				}
    			}
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Checkout> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		amount = this.value;
    		$$invalidate(1, amount);
    	}

    	function input12_input_handler() {
    		amount = this.value;
    		$$invalidate(1, amount);
    	}

    	function input13_input_handler() {
    		description = this.value;
    		$$invalidate(2, description);
    	}

    	$$self.$capture_state = () => ({
    		startARest,
    		setNewNotification,
    		mppublic,
    		cardType,
    		amount,
    		description,
    		pixResponse,
    		feedPaymentData,
    		paymentPix,
    		initializeRemarkable
    	});

    	$$self.$inject_state = $$props => {
    		if ('mppublic' in $$props) mppublic = $$props.mppublic;
    		if ('cardType' in $$props) $$invalidate(0, cardType = $$props.cardType);
    		if ('amount' in $$props) $$invalidate(1, amount = $$props.amount);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    		if ('pixResponse' in $$props) $$invalidate(3, pixResponse = $$props.pixResponse);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cardType,
    		amount,
    		description,
    		pixResponse,
    		paymentPix,
    		initializeRemarkable,
    		input0_input_handler,
    		input12_input_handler,
    		input13_input_handler
    	];
    }

    class Checkout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkout",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\layout\Login.svelte generated by Svelte v3.46.2 */

    const { document: document_1$1 } = globals;

    const file$g = "src\\layout\\Login.svelte";

    // (31:16) {#if loginText == ''}
    function create_if_block$f(ctx) {
    	let div;
    	let svg;
    	let circle;
    	let animateTransform;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			animateTransform = svg_element("animateTransform");
    			attr_dev(animateTransform, "attributeName", "transform");
    			attr_dev(animateTransform, "type", "rotate");
    			attr_dev(animateTransform, "repeatCount", "indefinite");
    			attr_dev(animateTransform, "dur", "1.7543859649122806s");
    			attr_dev(animateTransform, "values", "0 50 50;360 50 50");
    			attr_dev(animateTransform, "keyTimes", "0;1");
    			add_location(animateTransform, file$g, 34, 24, 1931);
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", "#ffffff");
    			attr_dev(circle, "stroke-width", "7");
    			attr_dev(circle, "r", "18");
    			attr_dev(circle, "stroke-dasharray", "84.82300164692441 30.274333882308138");
    			add_location(circle, file$g, 33, 22, 1772);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			set_style(svg, "margin", "auto");
    			set_style(svg, "background", "none");
    			set_style(svg, "display", "block");
    			set_style(svg, "shape-rendering", "auto");
    			attr_dev(svg, "width", "131px");
    			attr_dev(svg, "height", "131px");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid");
    			add_location(svg, file$g, 32, 20, 1504);
    			attr_dev(div, "class", "svg-loader");
    			add_location(div, file$g, 31, 18, 1458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    			append_dev(circle, animateTransform);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$f.name,
    		type: "if",
    		source: "(31:16) {#if loginText == ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let link;
    	let script;
    	let script_src_value;
    	let t0;
    	let div17;
    	let div0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div13;
    	let div5;
    	let form0;
    	let div1;
    	let input0;
    	let t2;
    	let i0;
    	let t3;
    	let label0;
    	let t5;
    	let div2;
    	let input1;
    	let t6;
    	let i1;
    	let t7;
    	let label1;
    	let t9;
    	let i2;
    	let t10;
    	let div4;
    	let div3;
    	let t11;
    	let input2;
    	let t12;
    	let div12;
    	let form1;
    	let div6;
    	let input3;
    	let t13;
    	let i3;
    	let t14;
    	let label2;
    	let t16;
    	let div7;
    	let input4;
    	let t17;
    	let i4;
    	let t18;
    	let label3;
    	let t20;
    	let div8;
    	let input5;
    	let t21;
    	let i5;
    	let t22;
    	let label4;
    	let t24;
    	let i6;
    	let t25;
    	let div9;
    	let input6;
    	let t26;
    	let i7;
    	let t27;
    	let label5;
    	let t29;
    	let i8;
    	let t30;
    	let div11;
    	let div10;
    	let svg0;
    	let circle;
    	let animateTransform;
    	let t31;
    	let input7;
    	let t32;
    	let div16;
    	let div14;
    	let p0;
    	let t33;
    	let strong0;
    	let t35;
    	let div15;
    	let p1;
    	let t36;
    	let strong1;
    	let t38;
    	let div18;
    	let span0;
    	let t39;
    	let span1;
    	let t40;
    	let svg1;
    	let defs;
    	let filter;
    	let feColorMatrix;
    	let mounted;
    	let dispose;
    	let if_block = /*loginText*/ ctx[2] == '' && create_if_block$f(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			script = element("script");
    			t0 = space();
    			div17 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t1 = space();
    			div13 = element("div");
    			div5 = element("div");
    			form0 = element("form");
    			div1 = element("div");
    			input0 = element("input");
    			t2 = space();
    			i0 = element("i");
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Username";
    			t5 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t6 = space();
    			i1 = element("i");
    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "Password";
    			t9 = space();
    			i2 = element("i");
    			t10 = space();
    			div4 = element("div");
    			div3 = element("div");
    			if (if_block) if_block.c();
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			div12 = element("div");
    			form1 = element("form");
    			div6 = element("div");
    			input3 = element("input");
    			t13 = space();
    			i3 = element("i");
    			t14 = space();
    			label2 = element("label");
    			label2.textContent = "Name";
    			t16 = space();
    			div7 = element("div");
    			input4 = element("input");
    			t17 = space();
    			i4 = element("i");
    			t18 = space();
    			label3 = element("label");
    			label3.textContent = "Email address";
    			t20 = space();
    			div8 = element("div");
    			input5 = element("input");
    			t21 = space();
    			i5 = element("i");
    			t22 = space();
    			label4 = element("label");
    			label4.textContent = "Password";
    			t24 = space();
    			i6 = element("i");
    			t25 = space();
    			div9 = element("div");
    			input6 = element("input");
    			t26 = space();
    			i7 = element("i");
    			t27 = space();
    			label5 = element("label");
    			label5.textContent = "Confirm pass";
    			t29 = space();
    			i8 = element("i");
    			t30 = space();
    			div11 = element("div");
    			div10 = element("div");
    			svg0 = svg_element("svg");
    			circle = svg_element("circle");
    			animateTransform = svg_element("animateTransform");
    			t31 = space();
    			input7 = element("input");
    			t32 = space();
    			div16 = element("div");
    			div14 = element("div");
    			p0 = element("p");
    			t33 = text("Já possui cadastro? ");
    			strong0 = element("strong");
    			strong0.textContent = "Fazer Login";
    			t35 = space();
    			div15 = element("div");
    			p1 = element("p");
    			t36 = text("Não tem conta? ");
    			strong1 = element("strong");
    			strong1.textContent = "Fazer cadastro";
    			t38 = space();
    			div18 = element("div");
    			span0 = element("span");
    			t39 = space();
    			span1 = element("span");
    			t40 = space();
    			svg1 = svg_element("svg");
    			defs = svg_element("defs");
    			filter = svg_element("filter");
    			feColorMatrix = svg_element("feColorMatrix");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://use.typekit.net/bcx4cmo.css");
    			add_location(link, file$g, 1, 4, 19);
    			if (!src_url_equal(script.src, script_src_value = "https://kit.fontawesome.com/1175358d69.js")) attr_dev(script, "src", script_src_value);
    			attr_dev(script, "crossorigin", "anonymous");
    			add_location(script, file$g, 2, 4, 91);
    			if (!src_url_equal(img.src, img_src_value = "./images/login-icon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$g, 7, 6, 264);
    			attr_dev(div0, "class", "logo");
    			add_location(div0, file$g, 6, 4, 238);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "username");
    			attr_dev(input0, "id", "username");
    			add_location(input0, file$g, 13, 16, 510);
    			attr_dev(i0, "class", "fa fa-user-secret left");
    			add_location(i0, file$g, 14, 16, 599);
    			attr_dev(label0, "for", "username");
    			add_location(label0, file$g, 15, 16, 655);
    			attr_dev(div1, "class", "container-field");
    			add_location(div1, file$g, 12, 12, 463);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "id", "password");
    			add_location(input1, file$g, 23, 14, 1039);
    			attr_dev(i1, "class", "fas fa-lock left");
    			add_location(i1, file$g, 24, 14, 1130);
    			attr_dev(label1, "for", "password");
    			add_location(label1, file$g, 25, 14, 1178);
    			attr_dev(i2, "class", "far fa-eye-slash right");
    			add_location(i2, file$g, 26, 14, 1232);
    			attr_dev(div2, "class", "container-field pass off-border");
    			add_location(div2, file$g, 22, 12, 978);
    			attr_dev(input2, "type", "submit");
    			input2.value = /*loginText*/ ctx[2];
    			add_location(input2, file$g, 40, 16, 2283);
    			attr_dev(div3, "class", "action-login");
    			add_location(div3, file$g, 29, 14, 1373);
    			attr_dev(div4, "class", "container-field");
    			add_location(div4, file$g, 28, 12, 1328);
    			attr_dev(form0, "autocomplete", "no");
    			add_location(form0, file$g, 11, 8, 388);
    			attr_dev(div5, "class", "form-register");
    			add_location(div5, file$g, 10, 6, 351);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "name");
    			attr_dev(input3, "id", "name");
    			add_location(input3, file$g, 48, 14, 2509);
    			attr_dev(i3, "class", "far fa-user left");
    			add_location(i3, file$g, 49, 14, 2566);
    			attr_dev(label2, "for", "name");
    			add_location(label2, file$g, 50, 14, 2614);
    			attr_dev(div6, "class", "container-field");
    			add_location(div6, file$g, 47, 11, 2464);
    			attr_dev(input4, "type", "email");
    			attr_dev(input4, "name", "email");
    			attr_dev(input4, "id", "email2");
    			add_location(input4, file$g, 53, 14, 2723);
    			attr_dev(i4, "class", "far fa-envelope left");
    			add_location(i4, file$g, 54, 14, 2784);
    			attr_dev(label3, "for", "email2");
    			add_location(label3, file$g, 55, 14, 2836);
    			attr_dev(div7, "class", "container-field");
    			add_location(div7, file$g, 52, 12, 2678);
    			attr_dev(input5, "type", "password");
    			attr_dev(input5, "name", "password");
    			attr_dev(input5, "id", "password2");
    			add_location(input5, file$g, 58, 14, 2961);
    			attr_dev(i5, "class", "fas fa-lock left");
    			add_location(i5, file$g, 59, 14, 3031);
    			attr_dev(label4, "for", "password2");
    			add_location(label4, file$g, 60, 14, 3079);
    			attr_dev(i6, "class", "far fa-eye-slash right");
    			add_location(i6, file$g, 61, 14, 3134);
    			attr_dev(div8, "class", "container-field pass");
    			add_location(div8, file$g, 57, 12, 2911);
    			attr_dev(input6, "type", "password");
    			attr_dev(input6, "name", "cpassword");
    			attr_dev(input6, "id", "cpassword");
    			add_location(input6, file$g, 64, 14, 3267);
    			attr_dev(i7, "class", "fas fa-lock left");
    			add_location(i7, file$g, 65, 14, 3338);
    			attr_dev(label5, "for", "cpassword");
    			add_location(label5, file$g, 66, 14, 3386);
    			attr_dev(i8, "class", "far fa-eye-slash right");
    			add_location(i8, file$g, 67, 14, 3445);
    			attr_dev(div9, "class", "container-field pass off-border");
    			add_location(div9, file$g, 63, 12, 3206);
    			attr_dev(animateTransform, "attributeName", "transform");
    			attr_dev(animateTransform, "type", "rotate");
    			attr_dev(animateTransform, "repeatCount", "indefinite");
    			attr_dev(animateTransform, "dur", "1.7543859649122806s");
    			attr_dev(animateTransform, "values", "0 50 50;360 50 50");
    			attr_dev(animateTransform, "keyTimes", "0;1");
    			add_location(animateTransform, file$g, 73, 20, 4023);
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke", "#ffffff");
    			attr_dev(circle, "stroke-width", "7");
    			attr_dev(circle, "r", "18");
    			attr_dev(circle, "stroke-dasharray", "84.82300164692441 30.274333882308138");
    			add_location(circle, file$g, 72, 18, 3868);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			set_style(svg0, "margin", "auto");
    			set_style(svg0, "background", "none");
    			set_style(svg0, "display", "block");
    			set_style(svg0, "shape-rendering", "auto");
    			attr_dev(svg0, "width", "131px");
    			attr_dev(svg0, "height", "131px");
    			attr_dev(svg0, "viewBox", "0 0 100 100");
    			attr_dev(svg0, "preserveAspectRatio", "xMidYMid");
    			add_location(svg0, file$g, 71, 16, 3604);
    			attr_dev(div10, "class", "svg-loader");
    			add_location(div10, file$g, 70, 14, 3562);
    			attr_dev(input7, "type", "submit");
    			input7.value = "REGISTER";
    			add_location(input7, file$g, 78, 14, 4334);
    			attr_dev(div11, "class", "container-field");
    			add_location(div11, file$g, 69, 12, 3517);
    			add_location(form1, file$g, 46, 9, 2445);
    			attr_dev(div12, "class", "form-login unview");
    			add_location(div12, file$g, 45, 6, 2403);
    			attr_dev(div13, "class", "forms");
    			add_location(div13, file$g, 9, 4, 324);
    			add_location(strong0, file$g, 86, 32, 4599);
    			add_location(p0, file$g, 85, 8, 4562);
    			attr_dev(div14, "class", "login-action unview");
    			attr_dev(div14, "data-action", "login");
    			add_location(div14, file$g, 84, 6, 4477);
    			add_location(strong1, file$g, 91, 27, 4782);
    			add_location(p1, file$g, 90, 8, 4750);
    			attr_dev(div15, "class", "register-action");
    			attr_dev(div15, "data-action", "register");
    			add_location(div15, file$g, 89, 6, 4665);
    			attr_dev(div16, "class", "actions unview");
    			add_location(div16, file$g, 83, 4, 4441);
    			attr_dev(div17, "class", "content-controller");
    			add_location(div17, file$g, 5, 0, 200);
    			attr_dev(span0, "id", "morhpeus");
    			add_location(span0, file$g, 99, 2, 4897);
    			attr_dev(span1, "id", "neo");
    			add_location(span1, file$g, 100, 1, 4927);
    			attr_dev(div18, "class", "morph-text");
    			add_location(div18, file$g, 98, 0, 4869);
    			attr_dev(feColorMatrix, "in", "SourceGraphic");
    			attr_dev(feColorMatrix, "type", "matrix");
    			attr_dev(feColorMatrix, "values", "1 0 0 0 0\r\n\t\t\t\t\t\t\t\t\t0 1 0 0 0\r\n\t\t\t\t\t\t\t\t\t0 0 1 0 0\r\n\t\t\t\t\t\t\t\t\t0 0 0 255 -140");
    			add_location(feColorMatrix, file$g, 106, 3, 5020);
    			attr_dev(filter, "id", "threshold");
    			add_location(filter, file$g, 105, 2, 4992);
    			add_location(defs, file$g, 104, 1, 4982);
    			attr_dev(svg1, "id", "filters");
    			add_location(svg1, file$g, 103, 0, 4961);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1$1.head, link);
    			append_dev(document_1$1.head, script);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div0);
    			append_dev(div0, img);
    			append_dev(div17, t1);
    			append_dev(div17, div13);
    			append_dev(div13, div5);
    			append_dev(div5, form0);
    			append_dev(form0, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*username*/ ctx[0]);
    			append_dev(div1, t2);
    			append_dev(div1, i0);
    			append_dev(div1, t3);
    			append_dev(div1, label0);
    			append_dev(form0, t5);
    			append_dev(form0, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*password*/ ctx[1]);
    			append_dev(div2, t6);
    			append_dev(div2, i1);
    			append_dev(div2, t7);
    			append_dev(div2, label1);
    			append_dev(div2, t9);
    			append_dev(div2, i2);
    			append_dev(form0, t10);
    			append_dev(form0, div4);
    			append_dev(div4, div3);
    			if (if_block) if_block.m(div3, null);
    			append_dev(div3, t11);
    			append_dev(div3, input2);
    			append_dev(div13, t12);
    			append_dev(div13, div12);
    			append_dev(div12, form1);
    			append_dev(form1, div6);
    			append_dev(div6, input3);
    			append_dev(div6, t13);
    			append_dev(div6, i3);
    			append_dev(div6, t14);
    			append_dev(div6, label2);
    			append_dev(form1, t16);
    			append_dev(form1, div7);
    			append_dev(div7, input4);
    			append_dev(div7, t17);
    			append_dev(div7, i4);
    			append_dev(div7, t18);
    			append_dev(div7, label3);
    			append_dev(form1, t20);
    			append_dev(form1, div8);
    			append_dev(div8, input5);
    			append_dev(div8, t21);
    			append_dev(div8, i5);
    			append_dev(div8, t22);
    			append_dev(div8, label4);
    			append_dev(div8, t24);
    			append_dev(div8, i6);
    			append_dev(form1, t25);
    			append_dev(form1, div9);
    			append_dev(div9, input6);
    			append_dev(div9, t26);
    			append_dev(div9, i7);
    			append_dev(div9, t27);
    			append_dev(div9, label5);
    			append_dev(div9, t29);
    			append_dev(div9, i8);
    			append_dev(form1, t30);
    			append_dev(form1, div11);
    			append_dev(div11, div10);
    			append_dev(div10, svg0);
    			append_dev(svg0, circle);
    			append_dev(circle, animateTransform);
    			append_dev(div11, t31);
    			append_dev(div11, input7);
    			append_dev(div17, t32);
    			append_dev(div17, div16);
    			append_dev(div16, div14);
    			append_dev(div14, p0);
    			append_dev(p0, t33);
    			append_dev(p0, strong0);
    			append_dev(div16, t35);
    			append_dev(div16, div15);
    			append_dev(div15, p1);
    			append_dev(p1, t36);
    			append_dev(p1, strong1);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, div18, anchor);
    			append_dev(div18, span0);
    			append_dev(div18, t39);
    			append_dev(div18, span1);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, svg1, anchor);
    			append_dev(svg1, defs);
    			append_dev(defs, filter);
    			append_dev(filter, feColorMatrix);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(i2, "click", /*showPassword*/ ctx[4], false, false, false),
    					listen_dev(form0, "submit", prevent_default(/*makeLogin*/ ctx[5]), false, true, false),
    					listen_dev(div14, "click", /*changeForm*/ ctx[3], false, false, false),
    					listen_dev(div15, "click", /*changeForm*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
    				set_input_value(input0, /*username*/ ctx[0]);
    			}

    			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
    				set_input_value(input1, /*password*/ ctx[1]);
    			}

    			if (/*loginText*/ ctx[2] == '') {
    				if (if_block) ; else {
    					if_block = create_if_block$f(ctx);
    					if_block.c();
    					if_block.m(div3, t11);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*loginText*/ 4) {
    				prop_dev(input2, "value", /*loginText*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link);
    			detach_dev(script);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div17);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(div18);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(svg1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	let username;
    	let password;
    	let email;
    	let loginText = "LOGIN";

    	onMount(async () => {
    		startAllInputs();
    		makeMorph();
    	});

    	const startAllInputs = () => {
    		let anyinput = document.querySelectorAll('input');

    		anyinput.forEach(thisInput => {
    			thisInput.addEventListener('change', () => checkInputValues(thisInput));
    			thisInput.addEventListener('keypress', () => checkInputValues(thisInput));
    		});
    	};

    	const checkInputValues = inpuType => {
    		if (inpuType.type != 'submit') {
    			if (inpuType.value.length > 0) {
    				inpuType.classList.add('hasvalue');
    			} else {
    				inpuType.classList.remove('hasvalue');
    			}
    		}
    	};

    	const changeForm = e => {
    		let login = document.querySelector('.login-action');
    		let register = document.querySelector('.register-action');
    		let flogin = document.querySelector('.form-login');
    		let fregister = document.querySelector('.form-register');

    		if (e.target.dataset.action == 'login') {
    			login.classList.add('unview');
    			flogin.classList.add('unview');
    			register.classList.remove('unview');
    			fregister.classList.remove('unview');
    		} else {
    			register.classList.add('unview');
    			fregister.classList.add('unview');
    			login.classList.remove('unview');
    			flogin.classList.remove('unview');
    		}
    	};

    	const showPassword = e => {
    		let showpass = document.querySelector('#password');

    		showpass.type === 'password'
    		? showpass.type = 'text'
    		: showpass.type = 'password';

    		['fa-eye', 'fa-eye-slash'].map(multipleToggle => e.target.classList.toggle(multipleToggle));
    	};

    	const makeLogin = async () => {
    		let json = { username, password, email };
    		$$invalidate(2, loginText = '');

    		//startRestLoading();
    		const logged = await startARest('/login', 'POST', json);

    		if (logged) {
    			setNewNotification('Login efetuado com sucesso, você será redirecionado', 'success');
    			$$invalidate(2, loginText = "LOGIN");

    			if (logged[0].token != undefined) {
    				setCookie('token', logged[0].token, 30);
    				window.location.href = '/user';
    			}
    		}
    	};

    	const makeMorph = () => {
    		let elts = {
    			text1: document.getElementById("morhpeus"),
    			text2: document.getElementById("neo")
    		};

    		let texts = [
    			"Squadevops .Inc",
    			"Unity",
    			"Angular.js",
    			"Svelte.js",
    			"JavaScript",
    			"Node",
    			"PostgreSQL"
    		];

    		let morphTime = 2;
    		let cooldownTime = 1.25;
    		let textIndex = texts.length - 1;
    		let time = new Date();
    		let morph = 0;
    		let cooldown = cooldownTime;
    		elts.text1.textContent = texts[textIndex % texts.length];
    		elts.text2.textContent = texts[(textIndex + 1) % texts.length];

    		const doMorph = () => {
    			morph -= cooldown;
    			cooldown = 0;
    			let fraction = morph / morphTime;

    			if (fraction > 1) {
    				cooldown = cooldownTime;
    				fraction = 1;
    			}

    			setMorph(fraction);
    		};

    		const setMorph = fraction => {
    			// fraction = Math.cos(fraction * Math.PI) / -2 + .5;
    			elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;

    			elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    			fraction = 1 - fraction;
    			elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    			elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    			elts.text1.textContent = texts[textIndex % texts.length];
    			elts.text2.textContent = texts[(textIndex + 1) % texts.length];
    		};

    		const doCooldown = () => {
    			morph = 0;
    			elts.text2.style.filter = "";
    			elts.text2.style.opacity = "100%";
    			elts.text1.style.filter = "";
    			elts.text1.style.opacity = "0%";
    		};

    		const animate = () => {
    			requestAnimationFrame(animate);
    			let newTime = new Date();
    			let shouldIncrementIndex = cooldown > 0;
    			let dt = (newTime - time) / 1000;
    			time = newTime;
    			cooldown -= dt;

    			if (cooldown <= 0) {
    				if (shouldIncrementIndex) {
    					textIndex++;
    				}

    				doMorph();
    			} else {
    				doCooldown();
    			}
    		};

    		animate();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(0, username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		setCookie,
    		getCookie,
    		checkCookie,
    		username,
    		password,
    		email,
    		loginText,
    		startAllInputs,
    		checkInputValues,
    		changeForm,
    		showPassword,
    		makeLogin,
    		makeMorph
    	});

    	$$self.$inject_state = $$props => {
    		if ('username' in $$props) $$invalidate(0, username = $$props.username);
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    		if ('email' in $$props) email = $$props.email;
    		if ('loginText' in $$props) $$invalidate(2, loginText = $$props.loginText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		username,
    		password,
    		loginText,
    		changeForm,
    		showPassword,
    		makeLogin,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\layout\Unauthorized.svelte generated by Svelte v3.46.2 */
    const file$f = "src\\layout\\Unauthorized.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Unauthorized";
    			if (!src_url_equal(img.src, img_src_value = "/images/unauthorized.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "unauthorized-image");
    			add_location(img, file$f, 1, 4, 43);
    			add_location(h1, file$f, 2, 4, 119);
    			attr_dev(div, "class", "unauthorized-controller");
    			add_location(div, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Unauthorized', slots, []);

    	onMount(async () => {
    		goToHome();
    	});

    	const goToHome = () => {
    		let progressBar = document.createElement('progress');
    		progressBar.setAttribute('max', '250');
    		progressBar.setAttribute('value', '250');
    		progressBar.setAttribute('class', 'unauthorized-progress');
    		document.body.append(progressBar);

    		let clearProgress = setInterval(
    			function () {
    				progressBar.value = progressBar.value - 1;

    				if (progressBar.value == 0) {
    					clearInterval(clearProgress);
    					progressBar.classList.add('hide');
    					setNewNotification('Você será redirecionado!', 'success');

    					setTimeout(
    						() => {
    							window.location.href = '/';
    						},
    						1000
    					);
    				}
    			},
    			25
    		);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Unauthorized> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		setNewNotification,
    		goToHome
    	});

    	return [];
    }

    class Unauthorized extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Unauthorized",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    const rollDown = () => {
            
        let list = document.querySelector('.list-inside-content');

         setTimeout(() => {
         list.scrollTo({
             top: list.scrollHeight,
             behavior: 'smooth'
         });
         }, 800);
         
     };

    /* src\editors\Word.svelte generated by Svelte v3.46.2 */
    const file$e = "src\\editors\\Word.svelte";

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Titles == 'string'}
    function create_if_block_6$6(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Titles*/ ctx[4]);
    			add_location(h3, file$e, 16, 16, 477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16) set_data_dev(t, /*Titles*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$6.name,
    		type: "if",
    		source: "(16:12) {#if typeof Titles == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Titles != 'string'}
    function create_if_block_1$e(ctx) {
    	let each_1_anchor;
    	let each_value = /*Titles*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$d(get_each_context$d(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles, deleteWord, handleEditValue*/ 1296) {
    				each_value = /*Titles*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$d(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$d(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$e.name,
    		type: "if",
    		source: "(22:12) {#if typeof Titles != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (26:28) {#if item.title}
    function create_if_block_5$a(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[18].title + "";
    	let t;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "title");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[18].id);
    			add_location(span, file$e, 26, 32, 800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && t_value !== (t_value = /*item*/ ctx[18].title + "")) set_data_dev(t, t_value);

    			if (dirty & /*Titles*/ 16 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[18].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$a.name,
    		type: "if",
    		source: "(26:28) {#if item.title}",
    		ctx
    	});

    	return block;
    }

    // (31:28) {#if item.subtitle}
    function create_if_block_4$a(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[18].subtitle + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "subtitle");
    			add_location(span, file$e, 31, 32, 1047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && t_value !== (t_value = /*item*/ ctx[18].subtitle + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$a.name,
    		type: "if",
    		source: "(31:28) {#if item.subtitle}",
    		ctx
    	});

    	return block;
    }

    // (36:28) {#if item.location}
    function create_if_block_3$e(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[18].location + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "location");
    			add_location(span, file$e, 36, 32, 1282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && t_value !== (t_value = /*item*/ ctx[18].location + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$e.name,
    		type: "if",
    		source: "(36:28) {#if item.location}",
    		ctx
    	});

    	return block;
    }

    // (41:28) {#if item.language}
    function create_if_block_2$e(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[18].language + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "language");
    			add_location(span, file$e, 41, 32, 1517);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && t_value !== (t_value = /*item*/ ctx[18].language + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$e.name,
    		type: "if",
    		source: "(41:28) {#if item.language}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Titles as item, key}
    function create_each_block$d(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div;
    	let i0;
    	let t4;
    	let i1;
    	let i1_data_id_value;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[18].title && create_if_block_5$a(ctx);
    	let if_block1 = /*item*/ ctx[18].subtitle && create_if_block_4$a(ctx);
    	let if_block2 = /*item*/ ctx[18].location && create_if_block_3$e(ctx);
    	let if_block3 = /*item*/ ctx[18].language && create_if_block_2$e(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			div = element("div");
    			i0 = element("i");
    			t4 = space();
    			i1 = element("i");
    			t5 = space();
    			add_location(p, file$e, 24, 24, 717);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$e, 47, 28, 1783);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[18].id);
    			add_location(i1, file$e, 48, 28, 1869);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$e, 46, 24, 1725);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$e, 23, 20, 667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(p, t2);
    			if (if_block3) if_block3.m(p, null);
    			append_dev(li, t3);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t4);
    			append_dev(div, i1);
    			append_dev(li, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*deleteWord*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[18].title) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$a(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[18].subtitle) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4$a(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[18].location) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3$e(ctx);
    					if_block2.c();
    					if_block2.m(p, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*item*/ ctx[18].language) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2$e(ctx);
    					if_block3.c();
    					if_block3.m(p, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*Titles*/ 16 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[18].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$d.name,
    		type: "each",
    		source: "(23:16) {#each Titles as item, key}",
    		ctx
    	});

    	return block;
    }

    // (82:8) {:else}
    function create_else_block$e(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$e, 82, 12, 2996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateWord*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$e.name,
    		type: "else",
    		source: "(82:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (80:8) {#if editorCreated}
    function create_if_block$e(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$e, 80, 12, 2903);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createWord*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$e.name,
    		type: "if",
    		source: "(80:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div10;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div9;
    	let div8;
    	let div5;
    	let input0;
    	let t7;
    	let div6;
    	let input1;
    	let t8;
    	let div7;
    	let select;
    	let option0;
    	let option1;
    	let t11;
    	let textarea;
    	let t12;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Titles*/ ctx[4] == 'string' && create_if_block_6$6(ctx);
    	let if_block1 = typeof /*Titles*/ ctx[4] != 'string' && create_if_block_1$e(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[2]) return create_if_block$e;
    		return create_else_block$e;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			input0 = element("input");
    			t7 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t8 = space();
    			div7 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "PT-BR";
    			option1 = element("option");
    			option1.textContent = "EN";
    			t11 = space();
    			textarea = element("textarea");
    			t12 = space();
    			if_block2.c();
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$e, 3, 12, 107);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$e, 2, 8, 70);
    			add_location(p, file$e, 6, 12, 224);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$e, 9, 12, 282);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$e, 5, 8, 160);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$e, 1, 4, 39);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$e, 13, 8, 387);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$e, 12, 4, 344);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$e, 56, 4, 2079);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "title");
    			add_location(input0, file$e, 61, 16, 2238);
    			attr_dev(div5, "class", "input-control");
    			add_location(div5, file$e, 60, 12, 2193);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "location");
    			add_location(input1, file$e, 64, 16, 2378);
    			attr_dev(div6, "class", "input-control");
    			add_location(div6, file$e, 63, 12, 2333);
    			option0.__value = "pt-br";
    			option0.value = option0.__value;
    			attr_dev(option0, "default", "");
    			option0.selected = true;
    			add_location(option0, file$e, 68, 20, 2599);
    			option1.__value = "en";
    			option1.value = option1.__value;
    			add_location(option1, file$e, 69, 20, 2674);
    			attr_dev(select, "name", "language");
    			attr_dev(select, "id", "language");
    			add_location(select, file$e, 67, 16, 2515);
    			attr_dev(div7, "class", "input-control");
    			add_location(div7, file$e, 66, 12, 2470);
    			attr_dev(div8, "class", "three-inputs");
    			add_location(div8, file$e, 59, 8, 2153);
    			attr_dev(textarea, "id", "");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			add_location(textarea, file$e, 75, 8, 2781);
    			attr_dev(div9, "class", "content-creator");
    			add_location(div9, file$e, 57, 4, 2112);
    			attr_dev(div10, "class", "content word-editor");
    			add_location(div10, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div10, t3);
    			append_dev(div10, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div10, t5);
    			append_dev(div10, div4);
    			append_dev(div10, t6);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, input0);
    			set_input_value(input0, /*exampleTitle*/ ctx[0]);
    			append_dev(div8, t7);
    			append_dev(div8, div6);
    			append_dev(div6, input1);
    			set_input_value(input1, /*location*/ ctx[3]);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(div9, t11);
    			append_dev(div9, textarea);
    			set_input_value(textarea, /*exampleLorem*/ ctx[1]);
    			append_dev(div9, t12);
    			if_block2.m(div9, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[9], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(select, "change", /*getLanguage*/ ctx[5], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Titles*/ ctx[4] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$6(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Titles*/ ctx[4] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$e(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*exampleTitle*/ 1 && input0.value !== /*exampleTitle*/ ctx[0]) {
    				set_input_value(input0, /*exampleTitle*/ ctx[0]);
    			}

    			if (dirty & /*location*/ 8 && input1.value !== /*location*/ ctx[3]) {
    				set_input_value(input1, /*location*/ ctx[3]);
    			}

    			if (dirty & /*exampleLorem*/ 2) {
    				set_input_value(textarea, /*exampleLorem*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div9, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Word', slots, []);
    	let exampleTitle = 'Example Title';
    	let exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!';
    	let editorCreated = true;
    	let identifier = null;
    	let location = 'section-default';
    	let language = 'pt-br';
    	let Titles = [];
    	let Token = getCookie('token');

    	onMount(async () => {
    		checkLogged();
    		await feedUpdate();
    	});

    	const getLanguage = e => {
    		language = e.target.value;
    	};

    	const feedUpdate = async () => {
    		startRestLoading();
    		const res = await startARest('/title', 'GET', null, true, null, null, Token);

    		if (res != undefined) {
    			$$invalidate(4, Titles = res[0].getTitles);
    			setNewNotification('Títulos carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(4, Titles = 'Sem itens');
    		}

    		rollDown();
    	};

    	const createWord = async () => {
    		let json = {
    			location,
    			title: exampleTitle,
    			subtitle: exampleLorem,
    			language
    		};

    		await startARest('/title/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const updateWord = async () => {
    		let json = {
    			location,
    			title: exampleTitle,
    			subtitle: exampleLorem,
    			language
    		};

    		await startARest(`/title/update/${identifier}`, 'PUT', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			550
    		);
    	};

    	const deleteWord = async e => {
    		await startARest(`/title/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const startEditor = e => {
    		$$invalidate(0, exampleTitle = 'Example Title');
    		$$invalidate(1, exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!');
    		language = 'pt-br';
    		$$invalidate(3, location = 'section-default');
    		$$invalidate(2, editorCreated = true);
    	};

    	const handleEditValue = e => {
    		let title = e.target.parentElement.parentElement.children[0].children[0].innerHTML;
    		let subtitle = e.target.parentElement.parentElement.children[0].children[1].innerHTML;
    		let locationHtml = e.target.parentElement.parentElement.children[0].children[2].innerHTML;
    		let languageHtml = e.target.parentElement.parentElement.children[0].children[3].innerHTML;
    		let ident = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		$$invalidate(0, exampleTitle = title);
    		$$invalidate(1, exampleLorem = subtitle);
    		identifier = ident;
    		$$invalidate(3, location = locationHtml);
    		language = languageHtml;
    		$$invalidate(2, editorCreated = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Word> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		exampleTitle = this.value;
    		$$invalidate(0, exampleTitle);
    	}

    	function input1_input_handler() {
    		location = this.value;
    		$$invalidate(3, location);
    	}

    	function textarea_input_handler() {
    		exampleLorem = this.value;
    		$$invalidate(1, exampleLorem);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		getCookie,
    		checkLogged,
    		rollDown,
    		exampleTitle,
    		exampleLorem,
    		editorCreated,
    		identifier,
    		location,
    		language,
    		Titles,
    		Token,
    		getLanguage,
    		feedUpdate,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('exampleTitle' in $$props) $$invalidate(0, exampleTitle = $$props.exampleTitle);
    		if ('exampleLorem' in $$props) $$invalidate(1, exampleLorem = $$props.exampleLorem);
    		if ('editorCreated' in $$props) $$invalidate(2, editorCreated = $$props.editorCreated);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    		if ('location' in $$props) $$invalidate(3, location = $$props.location);
    		if ('language' in $$props) language = $$props.language;
    		if ('Titles' in $$props) $$invalidate(4, Titles = $$props.Titles);
    		if ('Token' in $$props) Token = $$props.Token;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		exampleTitle,
    		exampleLorem,
    		editorCreated,
    		location,
    		Titles,
    		getLanguage,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler
    	];
    }

    class Word extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Word",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\editors\Video.svelte generated by Svelte v3.46.2 */

    const { console: console_1 } = globals;
    const file$d = "src\\editors\\Video.svelte";

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Videos == 'string'}
    function create_if_block_3$d(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Não há vídeos cadastrados";
    			add_location(h3, file$d, 16, 16, 455);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$d.name,
    		type: "if",
    		source: "(16:12) {#if typeof Videos == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Videos != 'string'}
    function create_if_block_2$d(ctx) {
    	let each_1_anchor;
    	let each_value = /*Videos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Videos, deleteVideo, handleEditValue*/ 25) {
    				each_value = /*Videos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$d.name,
    		type: "if",
    		source: "(22:12) {#if typeof Videos != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Videos as item, i}
    function create_each_block$c(ctx) {
    	let li;
    	let p;
    	let span0;
    	let div0;
    	let video;
    	let source;
    	let source_src_value;
    	let t0;
    	let span1;
    	let t1_value = /*item*/ ctx[11].slice(47) + "";
    	let t1;
    	let t2;
    	let div1;
    	let i0;
    	let t3;
    	let i1;
    	let i1_data_id_value;
    	let t4;
    	let li_data_video_value;
    	let li_data_item_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			span0 = element("span");
    			div0 = element("div");
    			video = element("video");
    			source = element("source");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			i0 = element("i");
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			if (!src_url_equal(source.src, source_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/videos/" + /*item*/ ctx[11])) attr_dev(source, "src", source_src_value);
    			add_location(source, file$d, 28, 40, 1012);
    			video.autoplay = true;
    			video.muted = true;
    			video.loop = true;
    			add_location(video, file$d, 27, 36, 943);
    			attr_dev(div0, "class", "mini-player");
    			add_location(div0, file$d, 26, 32, 880);
    			add_location(span0, file$d, 25, 28, 840);
    			add_location(span1, file$d, 32, 28, 1246);
    			add_location(p, file$d, 24, 24, 807);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$d, 37, 28, 1453);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[11].id);
    			add_location(i1, file$d, 38, 28, 1539);
    			attr_dev(div1, "class", "action-editors");
    			add_location(div1, file$d, 36, 24, 1395);
    			attr_dev(li, "class", "item-editor");
    			attr_dev(li, "data-video", li_data_video_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/videos/" + /*item*/ ctx[11]);
    			attr_dev(li, "data-item", li_data_item_value = /*item*/ ctx[11]);
    			add_location(li, file$d, 23, 20, 660);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, span0);
    			append_dev(span0, div0);
    			append_dev(div0, video);
    			append_dev(video, source);
    			append_dev(p, t0);
    			append_dev(p, span1);
    			append_dev(span1, t1);
    			append_dev(li, t2);
    			append_dev(li, div1);
    			append_dev(div1, i0);
    			append_dev(div1, t3);
    			append_dev(div1, i1);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[3], false, false, false),
    					listen_dev(i1, "click", /*deleteVideo*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Videos*/ 1 && !src_url_equal(source.src, source_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/videos/" + /*item*/ ctx[11])) {
    				attr_dev(source, "src", source_src_value);
    			}

    			if (dirty & /*Videos*/ 1 && t1_value !== (t1_value = /*item*/ ctx[11].slice(47) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*Videos*/ 1 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[11].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}

    			if (dirty & /*Videos*/ 1 && li_data_video_value !== (li_data_video_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/videos/" + /*item*/ ctx[11])) {
    				attr_dev(li, "data-video", li_data_video_value);
    			}

    			if (dirty & /*Videos*/ 1 && li_data_item_value !== (li_data_item_value = /*item*/ ctx[11])) {
    				attr_dev(li, "data-item", li_data_item_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$c.name,
    		type: "each",
    		source: "(23:16) {#each Videos as item, i}",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#if thisVideo != undefined}
    function create_if_block$d(ctx) {
    	let div;
    	let i;
    	let t0;
    	let video;
    	let source;
    	let source_src_value;
    	let track;
    	let t1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[1]) return create_if_block_1$d;
    		return create_else_block$d;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t0 = space();
    			video = element("video");
    			source = element("source");
    			track = element("track");
    			t1 = space();
    			if_block.c();
    			attr_dev(i, "class", "fas fa-times");
    			add_location(i, file$d, 50, 12, 1868);
    			if (!src_url_equal(source.src, source_src_value = /*thisVideo*/ ctx[2])) attr_dev(source, "src", source_src_value);
    			add_location(source, file$d, 52, 16, 1966);
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$d, 53, 16, 2013);
    			video.controls = true;
    			add_location(video, file$d, 51, 12, 1932);
    			attr_dev(div, "class", "video-controller");
    			add_location(div, file$d, 49, 8, 1824);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t0);
    			append_dev(div, video);
    			append_dev(video, source);
    			append_dev(video, track);
    			append_dev(div, t1);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*closeVideo*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*thisVideo*/ 4 && !src_url_equal(source.src, source_src_value = /*thisVideo*/ ctx[2])) {
    				attr_dev(source, "src", source_src_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$d.name,
    		type: "if",
    		source: "(49:4) {#if thisVideo != undefined}",
    		ctx
    	});

    	return block;
    }

    // (58:12) {:else}
    function create_else_block$d(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$d.name,
    		type: "else",
    		source: "(58:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:12) {#if editorCreated}
    function create_if_block_1$d(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cadastrar video";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$d, 56, 16, 2109);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createVideo*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$d.name,
    		type: "if",
    		source: "(56:12) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let t7;
    	let div5;
    	let input;
    	let t8;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Videos*/ ctx[0] == 'string' && create_if_block_3$d(ctx);
    	let if_block1 = typeof /*Videos*/ ctx[0] != 'string' && create_if_block_2$d(ctx);
    	let if_block2 = /*thisVideo*/ ctx[2] != undefined && create_if_block$d(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			div5 = element("div");
    			input = element("input");
    			t8 = space();
    			button = element("button");
    			button.textContent = "Visualizar video";
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$d, 3, 12, 108);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$d, 2, 8, 71);
    			add_location(p, file$d, 6, 12, 202);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$d, 9, 12, 260);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$d, 5, 8, 161);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$d, 1, 4, 40);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$d, 13, 8, 365);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$d, 12, 4, 322);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$d, 46, 4, 1751);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "name", "video");
    			attr_dev(input, "id", "video");
    			attr_dev(input, "accept", "video/mp4");
    			add_location(input, file$d, 66, 8, 2395);
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$d, 67, 8, 2467);
    			attr_dev(div5, "class", "content-creator");
    			add_location(div5, file$d, 64, 4, 2354);
    			attr_dev(div6, "class", "content video-editor");
    			add_location(div6, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div6, t3);
    			append_dev(div6, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div6, t5);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			if (if_block2) if_block2.m(div6, null);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, input);
    			append_dev(div5, t8);
    			append_dev(div5, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*previewVideo*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Videos*/ ctx[0] == 'string') {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$d(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Videos*/ ctx[0] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$d(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thisVideo*/ ctx[2] != undefined) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$d(ctx);
    					if_block2.c();
    					if_block2.m(div6, t7);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Video', slots, []);
    	let Videos = [];
    	let editorCreated = true;
    	let preview = false;
    	let thisVideo;

    	onMount(async () => {
    		checkLogged();
    		feedUpdate();
    	});

    	const feedUpdate = async () => {
    		startRestLoading();
    		const res = await startARest('/video/list', 'GET', null);

    		if (res != undefined) {
    			let treatVideos = res[0].listStream;
    			let treatedVideos = [];

    			treatVideos.filter(video => {
    				if (video.replace('videos/', '').length != 0) {
    					treatedVideos.push(video.replace('videos/', ''));
    				}
    			});

    			$$invalidate(0, Videos = treatedVideos);
    			setNewNotification('Vídeos carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(0, Videos = 'Videos não cadastrados');
    		}
    	};

    	const handleEditValue = e => {
    		$$invalidate(2, thisVideo = e.target.parentElement.parentElement.dataset.video);
    		$$invalidate(1, editorCreated = false);
    	};

    	const deleteVideo = e => {
    		startARest(`/video/delete/${e.target.parentElement.parentElement.dataset.item}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    				preview = false;
    			},
    			500
    		);

    		rollDown();
    		setNewNotification('Vídeo deletado com sucesso!', 'success');
    	};

    	const previewVideo = () => {
    		let getVideo = document.querySelector('#video');
    		$$invalidate(2, thisVideo = window.URL.createObjectURL(getVideo.files[0]));
    		preview = true;
    		$$invalidate(1, editorCreated = true);
    	};

    	const createVideo = () => {
    		let getVideo = document.querySelector('#video');
    		let video = getVideo.files[0];
    		startARest('/video/create', 'POST', video, null, false, 'video');

    		setTimeout(
    			() => {
    				feedUpdate();
    				preview = false;
    				$$invalidate(2, thisVideo = undefined);
    			},
    			500
    		);

    		rollDown();

    		//CRIAR UMA MANEIRA DE PREVENIR MENSAGEM CASO RETORNE ERRO
    		setNewNotification('Vídeo criado com sucesso!', 'success');
    	};

    	const closeVideo = () => {
    		$$invalidate(2, thisVideo = undefined);
    	};

    	const updateVideo = () => {
    		console.log('em construção');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		checkLogged,
    		rollDown,
    		Videos,
    		editorCreated,
    		preview,
    		thisVideo,
    		feedUpdate,
    		handleEditValue,
    		deleteVideo,
    		previewVideo,
    		createVideo,
    		closeVideo,
    		updateVideo
    	});

    	$$self.$inject_state = $$props => {
    		if ('Videos' in $$props) $$invalidate(0, Videos = $$props.Videos);
    		if ('editorCreated' in $$props) $$invalidate(1, editorCreated = $$props.editorCreated);
    		if ('preview' in $$props) preview = $$props.preview;
    		if ('thisVideo' in $$props) $$invalidate(2, thisVideo = $$props.thisVideo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		Videos,
    		editorCreated,
    		thisVideo,
    		handleEditValue,
    		deleteVideo,
    		previewVideo,
    		createVideo,
    		closeVideo
    	];
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\editors\Image.svelte generated by Svelte v3.46.2 */
    const file$c = "src\\editors\\Image.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Images == 'string'}
    function create_if_block_3$c(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Não há imagens cadastradas";
    			add_location(h3, file$c, 16, 16, 455);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$c.name,
    		type: "if",
    		source: "(16:12) {#if typeof Images == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Images != 'string'}
    function create_if_block_2$c(ctx) {
    	let each_1_anchor;
    	let each_value = /*Images*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Images, deleteMedia, handleEditValue*/ 25) {
    				each_value = /*Images*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$c.name,
    		type: "if",
    		source: "(22:12) {#if typeof Images != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Images as item, i}
    function create_each_block$b(ctx) {
    	let li;
    	let p;
    	let span0;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let span1;
    	let t1_value = /*item*/ ctx[11].slice(47) + "";
    	let t1;
    	let t2;
    	let div1;
    	let i0;
    	let t3;
    	let i1;
    	let i1_data_id_value;
    	let t4;
    	let li_data_media_value;
    	let li_data_item_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			span0 = element("span");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			i0 = element("i");
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			if (!src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/media/" + /*item*/ ctx[11])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[11].slice(47));
    			add_location(img, file$c, 27, 9, 895);
    			attr_dev(div0, "class", "mini-player");
    			add_location(div0, file$c, 26, 32, 859);
    			add_location(span0, file$c, 25, 7, 819);
    			add_location(span1, file$c, 30, 28, 1100);
    			add_location(p, file$c, 24, 24, 807);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$c, 35, 28, 1307);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[11].id);
    			add_location(i1, file$c, 36, 28, 1393);
    			attr_dev(div1, "class", "action-editors");
    			add_location(div1, file$c, 34, 24, 1249);
    			attr_dev(li, "class", "item-editor");
    			attr_dev(li, "data-media", li_data_media_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/media/" + /*item*/ ctx[11]);
    			attr_dev(li, "data-item", li_data_item_value = /*item*/ ctx[11]);
    			add_location(li, file$c, 23, 20, 661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, span0);
    			append_dev(span0, div0);
    			append_dev(div0, img);
    			append_dev(p, t0);
    			append_dev(p, span1);
    			append_dev(span1, t1);
    			append_dev(li, t2);
    			append_dev(li, div1);
    			append_dev(div1, i0);
    			append_dev(div1, t3);
    			append_dev(div1, i1);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[3], false, false, false),
    					listen_dev(i1, "click", /*deleteMedia*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Images*/ 1 && !src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/media/" + /*item*/ ctx[11])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*Images*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[11].slice(47))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*Images*/ 1 && t1_value !== (t1_value = /*item*/ ctx[11].slice(47) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*Images*/ 1 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[11].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}

    			if (dirty & /*Images*/ 1 && li_data_media_value !== (li_data_media_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/media/" + /*item*/ ctx[11])) {
    				attr_dev(li, "data-media", li_data_media_value);
    			}

    			if (dirty & /*Images*/ 1 && li_data_item_value !== (li_data_item_value = /*item*/ ctx[11])) {
    				attr_dev(li, "data-item", li_data_item_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(23:16) {#each Images as item, i}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if thisMedia != undefined}
    function create_if_block$c(ctx) {
    	let div;
    	let i;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[1]) return create_if_block_1$c;
    		return create_else_block$c;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			if_block.c();
    			attr_dev(i, "class", "fas fa-times");
    			add_location(i, file$c, 48, 12, 1722);
    			if (!src_url_equal(img.src, img_src_value = /*thisMedia*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "register image");
    			add_location(img, file$c, 51, 3, 1832);
    			attr_dev(div, "class", "media-controller");
    			add_location(div, file$c, 47, 8, 1678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t0);
    			append_dev(div, img);
    			append_dev(div, t1);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*closeMedia*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*thisMedia*/ 4 && !src_url_equal(img.src, img_src_value = /*thisMedia*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(47:4) {#if thisMedia != undefined}",
    		ctx
    	});

    	return block;
    }

    // (56:12) {:else}
    function create_else_block$c(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$c.name,
    		type: "else",
    		source: "(56:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (54:12) {#if editorCreated}
    function create_if_block_1$c(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cadastrar imagem";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$c, 54, 16, 1929);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createMedia*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$c.name,
    		type: "if",
    		source: "(54:12) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let t7;
    	let div5;
    	let input;
    	let t8;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Images*/ ctx[0] == 'string' && create_if_block_3$c(ctx);
    	let if_block1 = typeof /*Images*/ ctx[0] != 'string' && create_if_block_2$c(ctx);
    	let if_block2 = /*thisMedia*/ ctx[2] != undefined && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			div5 = element("div");
    			input = element("input");
    			t8 = space();
    			button = element("button");
    			button.textContent = "Visualizar imagem";
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$c, 3, 12, 108);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$c, 2, 8, 71);
    			add_location(p, file$c, 6, 12, 202);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$c, 9, 12, 260);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$c, 5, 8, 161);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$c, 1, 4, 40);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$c, 13, 8, 365);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$c, 12, 4, 322);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$c, 44, 4, 1605);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "name", "image");
    			attr_dev(input, "id", "image");
    			attr_dev(input, "accept", "image/*");
    			add_location(input, file$c, 64, 8, 2216);
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$c, 65, 8, 2286);
    			attr_dev(div5, "class", "content-creator");
    			add_location(div5, file$c, 62, 4, 2175);
    			attr_dev(div6, "class", "content media-editor");
    			add_location(div6, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div6, t3);
    			append_dev(div6, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div6, t5);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			if (if_block2) if_block2.m(div6, null);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, input);
    			append_dev(div5, t8);
    			append_dev(div5, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*previewVideo*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Images*/ ctx[0] == 'string') {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$c(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Images*/ ctx[0] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$c(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thisMedia*/ ctx[2] != undefined) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$c(ctx);
    					if_block2.c();
    					if_block2.m(div6, t7);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Image', slots, []);
    	let Images = [];
    	let editorCreated = true;
    	let preview = false;
    	let thisMedia;

    	onMount(async () => {
    		checkLogged();
    		feedUpdate();
    	});

    	const feedUpdate = async () => {
    		startRestLoading();
    		const res = await startARest('/media/list', 'GET', null);

    		if (res != undefined) {
    			let treatImages = res[0].listStream;
    			let treatedImages = [];

    			treatImages.filter(media => {
    				if (media.replace('media/', '').length != 0) {
    					treatedImages.push(media.replace('media/', ''));
    				}
    			});

    			$$invalidate(0, Images = treatedImages);
    			setNewNotification('Imagens carregadas com sucesso!', 'success');
    		} else {
    			$$invalidate(0, Images = 'Imagens não cadastradas');
    		}
    	};

    	const handleEditValue = e => {
    		$$invalidate(2, thisMedia = e.target.parentElement.parentElement.dataset.media);
    		$$invalidate(1, editorCreated = false);
    	};

    	const deleteMedia = async e => {
    		await startARest(`/media/delete/${e.target.parentElement.parentElement.dataset.item}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    				preview = false;
    			},
    			500
    		);

    		rollDown();
    	}; //setNewNotification('Imagem deletada com sucesso!', 'success');

    	const previewVideo = () => {
    		let getMedia = document.querySelector('#image');
    		$$invalidate(2, thisMedia = window.URL.createObjectURL(getMedia.files[0]));
    		preview = true;
    		$$invalidate(1, editorCreated = true);
    	};

    	const createMedia = async () => {
    		let getMedia = document.querySelector('#image');
    		let media = getMedia.files[0];
    		await startARest('/media/create', 'POST', media, null, false, 'image');

    		setTimeout(
    			() => {
    				feedUpdate();
    				preview = false;
    				$$invalidate(2, thisMedia = undefined);
    			},
    			500
    		);

    		rollDown();
    	}; //setNewNotification('Imagem criada com sucesso!', 'success');

    	const closeMedia = () => {
    		$$invalidate(2, thisMedia = undefined);
    	};

    	const updateMedia = () => {
    		
    	}; //console.log('em construção')

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		checkLogged,
    		rollDown,
    		Images,
    		editorCreated,
    		preview,
    		thisMedia,
    		feedUpdate,
    		handleEditValue,
    		deleteMedia,
    		previewVideo,
    		createMedia,
    		closeMedia,
    		updateMedia
    	});

    	$$self.$inject_state = $$props => {
    		if ('Images' in $$props) $$invalidate(0, Images = $$props.Images);
    		if ('editorCreated' in $$props) $$invalidate(1, editorCreated = $$props.editorCreated);
    		if ('preview' in $$props) preview = $$props.preview;
    		if ('thisMedia' in $$props) $$invalidate(2, thisMedia = $$props.thisMedia);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		Images,
    		editorCreated,
    		thisMedia,
    		handleEditValue,
    		deleteMedia,
    		previewVideo,
    		createMedia,
    		closeMedia
    	];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\editors\Audio.svelte generated by Svelte v3.46.2 */
    const file$b = "src\\editors\\Audio.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Audios == 'string'}
    function create_if_block_3$b(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Não há audios cadastrados";
    			add_location(h3, file$b, 16, 16, 455);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$b.name,
    		type: "if",
    		source: "(16:12) {#if typeof Audios == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Audios != 'string'}
    function create_if_block_2$b(ctx) {
    	let each_1_anchor;
    	let each_value = /*Audios*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Audios, deleteAudio, handleEditValue*/ 25) {
    				each_value = /*Audios*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$b.name,
    		type: "if",
    		source: "(22:12) {#if typeof Audios != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Audios as item, i}
    function create_each_block$a(ctx) {
    	let li;
    	let p;
    	let span0;
    	let audio;
    	let source;
    	let source_src_value;
    	let t0;
    	let span1;
    	let t1_value = /*item*/ ctx[11].slice(47) + "";
    	let t1;
    	let t2;
    	let div;
    	let i0;
    	let t3;
    	let i1;
    	let i1_data_id_value;
    	let t4;
    	let li_data_audio_value;
    	let li_data_item_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			span0 = element("span");
    			audio = element("audio");
    			source = element("source");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div = element("div");
    			i0 = element("i");
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			if (!src_url_equal(source.src, source_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/audios/" + /*item*/ ctx[11])) attr_dev(source, "src", source_src_value);
    			add_location(source, file$b, 27, 36, 934);
    			audio.controls = true;
    			add_location(audio, file$b, 26, 32, 880);
    			add_location(span0, file$b, 25, 28, 840);
    			add_location(span1, file$b, 30, 28, 1124);
    			add_location(p, file$b, 24, 24, 807);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$b, 35, 28, 1331);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[11].id);
    			add_location(i1, file$b, 36, 28, 1417);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$b, 34, 24, 1273);
    			attr_dev(li, "class", "item-editor");
    			attr_dev(li, "data-audio", li_data_audio_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/audios/" + /*item*/ ctx[11]);
    			attr_dev(li, "data-item", li_data_item_value = /*item*/ ctx[11]);
    			add_location(li, file$b, 23, 20, 660);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, span0);
    			append_dev(span0, audio);
    			append_dev(audio, source);
    			append_dev(p, t0);
    			append_dev(p, span1);
    			append_dev(span1, t1);
    			append_dev(li, t2);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t3);
    			append_dev(div, i1);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[3], false, false, false),
    					listen_dev(i1, "click", /*deleteAudio*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Audios*/ 1 && !src_url_equal(source.src, source_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/audios/" + /*item*/ ctx[11])) {
    				attr_dev(source, "src", source_src_value);
    			}

    			if (dirty & /*Audios*/ 1 && t1_value !== (t1_value = /*item*/ ctx[11].slice(47) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*Audios*/ 1 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[11].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}

    			if (dirty & /*Audios*/ 1 && li_data_audio_value !== (li_data_audio_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/audios/" + /*item*/ ctx[11])) {
    				attr_dev(li, "data-audio", li_data_audio_value);
    			}

    			if (dirty & /*Audios*/ 1 && li_data_item_value !== (li_data_item_value = /*item*/ ctx[11])) {
    				attr_dev(li, "data-item", li_data_item_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(23:16) {#each Audios as item, i}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if thisAudio != undefined}
    function create_if_block$b(ctx) {
    	let div;
    	let i;
    	let t0;
    	let audio;
    	let source;
    	let source_src_value;
    	let track;
    	let t1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[1]) return create_if_block_1$b;
    		return create_else_block$b;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t0 = space();
    			audio = element("audio");
    			source = element("source");
    			track = element("track");
    			t1 = space();
    			if_block.c();
    			attr_dev(i, "class", "fas fa-times");
    			add_location(i, file$b, 48, 12, 1746);
    			if (!src_url_equal(source.src, source_src_value = /*thisAudio*/ ctx[2])) attr_dev(source, "src", source_src_value);
    			add_location(source, file$b, 50, 16, 1844);
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$b, 51, 16, 1891);
    			audio.controls = true;
    			add_location(audio, file$b, 49, 12, 1810);
    			attr_dev(div, "class", "audio-controller");
    			add_location(div, file$b, 47, 8, 1702);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t0);
    			append_dev(div, audio);
    			append_dev(audio, source);
    			append_dev(audio, track);
    			append_dev(div, t1);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*closeAudio*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*thisAudio*/ 4 && !src_url_equal(source.src, source_src_value = /*thisAudio*/ ctx[2])) {
    				attr_dev(source, "src", source_src_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(47:4) {#if thisAudio != undefined}",
    		ctx
    	});

    	return block;
    }

    // (56:12) {:else}
    function create_else_block$b(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$b.name,
    		type: "else",
    		source: "(56:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (54:12) {#if editorCreated}
    function create_if_block_1$b(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cadastrar audio";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$b, 54, 16, 1987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createAudio*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$b.name,
    		type: "if",
    		source: "(54:12) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let t7;
    	let div5;
    	let input;
    	let t8;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Audios*/ ctx[0] == 'string' && create_if_block_3$b(ctx);
    	let if_block1 = typeof /*Audios*/ ctx[0] != 'string' && create_if_block_2$b(ctx);
    	let if_block2 = /*thisAudio*/ ctx[2] != undefined && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			div5 = element("div");
    			input = element("input");
    			t8 = space();
    			button = element("button");
    			button.textContent = "Visualizar audio";
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$b, 3, 12, 108);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$b, 2, 8, 71);
    			add_location(p, file$b, 6, 12, 202);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$b, 9, 12, 260);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$b, 5, 8, 161);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$b, 1, 4, 40);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$b, 13, 8, 365);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$b, 12, 4, 322);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$b, 44, 4, 1629);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "name", "audio");
    			attr_dev(input, "id", "audio");
    			attr_dev(input, "accept", "audio/mp3");
    			add_location(input, file$b, 64, 8, 2273);
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$b, 65, 8, 2345);
    			attr_dev(div5, "class", "content-creator");
    			add_location(div5, file$b, 62, 4, 2232);
    			attr_dev(div6, "class", "content audio-editor");
    			add_location(div6, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div6, t3);
    			append_dev(div6, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div6, t5);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			if (if_block2) if_block2.m(div6, null);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, input);
    			append_dev(div5, t8);
    			append_dev(div5, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*previewAudio*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Audios*/ ctx[0] == 'string') {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$b(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Audios*/ ctx[0] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$b(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*thisAudio*/ ctx[2] != undefined) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$b(ctx);
    					if_block2.c();
    					if_block2.m(div6, t7);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Audio', slots, []);
    	let Audios = [];
    	let editorCreated = true;
    	let preview = false;
    	let thisAudio;

    	onMount(async () => {
    		checkLogged();
    		feedUpdate();
    	});

    	const feedUpdate = async () => {
    		startRestLoading();
    		const res = await startARest('/audio/list', 'GET', null);

    		if (res != undefined) {
    			let treatAudios = res[0].listStream;
    			let treatedAudios = [];

    			treatAudios.filter(audio => {
    				if (audio.replace('audios/', '').length != 0) {
    					treatedAudios.push(audio.replace('audios/', ''));
    				}
    			});

    			$$invalidate(0, Audios = treatedAudios);
    			setNewNotification('Audios carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(0, Audios = 'Audios não cadastrados');
    		}
    	};

    	const handleEditValue = e => {
    		$$invalidate(2, thisAudio = e.target.parentElement.parentElement.dataset.audio);
    		$$invalidate(1, editorCreated = false);
    	};

    	const deleteAudio = async e => {
    		await startARest(`/audio/delete/${e.target.parentElement.parentElement.dataset.item}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    				preview = false;
    			},
    			500
    		);

    		rollDown();
    	}; //setNewNotification('Audio deletado com sucesso!', 'success');

    	const previewAudio = () => {
    		let getAudio = document.querySelector('#audio');
    		$$invalidate(2, thisAudio = window.URL.createObjectURL(getAudio.files[0]));
    		preview = true;
    		$$invalidate(1, editorCreated = true);
    	};

    	const createAudio = async () => {
    		let getAudio = document.querySelector('#audio');
    		let audio = getAudio.files[0];
    		await startARest('/audio/create', 'POST', audio, null, false, 'audio');

    		setTimeout(
    			() => {
    				feedUpdate();
    				preview = false;
    				$$invalidate(2, thisAudio = undefined);
    			},
    			500
    		);

    		rollDown();
    	}; //setNewNotification('Audio criado com sucesso!', 'success');

    	const closeAudio = () => {
    		$$invalidate(2, thisAudio = undefined);
    	};

    	const updateAudio = () => {
    		
    	}; //console.log('em construção')

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Audio> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		checkLogged,
    		rollDown,
    		Audios,
    		editorCreated,
    		preview,
    		thisAudio,
    		feedUpdate,
    		handleEditValue,
    		deleteAudio,
    		previewAudio,
    		createAudio,
    		closeAudio,
    		updateAudio
    	});

    	$$self.$inject_state = $$props => {
    		if ('Audios' in $$props) $$invalidate(0, Audios = $$props.Audios);
    		if ('editorCreated' in $$props) $$invalidate(1, editorCreated = $$props.editorCreated);
    		if ('preview' in $$props) preview = $$props.preview;
    		if ('thisAudio' in $$props) $$invalidate(2, thisAudio = $$props.thisAudio);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		Audios,
    		editorCreated,
    		thisAudio,
    		handleEditValue,
    		deleteAudio,
    		previewAudio,
    		createAudio,
    		closeAudio
    	];
    }

    class Audio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Audio",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\editors\Payment.svelte generated by Svelte v3.46.2 */

    const file$a = "src\\editors\\Payment.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (10:16) {#if Payments.length <= 0}
    function create_if_block_8$2(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Não há pagamentos cadastrados";
    			add_location(h3, file$a, 10, 20, 309);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(10:16) {#if Payments.length <= 0}",
    		ctx
    	});

    	return block;
    }

    // (16:16) {#if Payments.length >= 1}
    function create_if_block$a(ctx) {
    	let li;
    	let p;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let span2;
    	let t5;
    	let span3;
    	let t7;
    	let span4;
    	let t9;
    	let span5;
    	let t11;
    	let span6;
    	let t13;
    	let span7;
    	let t15;
    	let each_1_anchor;
    	let each_value = /*Payments*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			span0 = element("span");
    			span0.textContent = "ID";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "Nome";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "Status";
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "Doação";
    			t7 = space();
    			span4 = element("span");
    			span4.textContent = "Pedido";
    			t9 = space();
    			span5 = element("span");
    			span5.textContent = "Data pagamento";
    			t11 = space();
    			span6 = element("span");
    			span6.textContent = "Tipo de pagamento";
    			t13 = space();
    			span7 = element("span");
    			span7.textContent = "Deletar?";
    			t15 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(span0, file$a, 19, 28, 598);
    			add_location(span1, file$a, 22, 28, 707);
    			add_location(span2, file$a, 25, 28, 818);
    			add_location(span3, file$a, 28, 28, 931);
    			add_location(span4, file$a, 31, 28, 1044);
    			add_location(span5, file$a, 34, 28, 1157);
    			add_location(span6, file$a, 37, 28, 1278);
    			add_location(span7, file$a, 40, 28, 1402);
    			set_style(p, "font-weight", "bold");
    			add_location(p, file$a, 18, 24, 538);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$a, 17, 20, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, span0);
    			append_dev(p, t1);
    			append_dev(p, span1);
    			append_dev(p, t3);
    			append_dev(p, span2);
    			append_dev(p, t5);
    			append_dev(p, span3);
    			append_dev(p, t7);
    			append_dev(p, span4);
    			append_dev(p, t9);
    			append_dev(p, span5);
    			append_dev(p, t11);
    			append_dev(p, span6);
    			append_dev(p, t13);
    			append_dev(p, span7);
    			insert_dev(target, t15, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*JSON, Payments, deletePayment, Date, undefined, delePixPayment*/ 13) {
    				each_value = /*Payments*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (detaching) detach_dev(t15);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(16:16) {#if Payments.length >= 1}",
    		ctx
    	});

    	return block;
    }

    // (85:24) {:else}
    function create_else_block$a(ctx) {
    	let li;
    	let p;
    	let span0;
    	let t0_value = /*item*/ ctx[5].id + "";
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*item*/ ctx[5].status + "";
    	let t3;
    	let span1_class_value;
    	let t4;
    	let t5;
    	let t6;
    	let span2;
    	let t7_value = /*item*/ ctx[5].purchase_order + "";
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let span3;
    	let t13;
    	let span4;
    	let t14_value = /*item*/ ctx[5].createdAt + "";
    	let t14;
    	let t15;
    	let span5;
    	let i;
    	let i_data_id_value;
    	let t16;
    	let li_data_item_value;
    	let li_data_id_value;
    	let li_data_purchaseorder_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[5].first_name && create_if_block_7$4(ctx);
    	let if_block1 = /*item*/ ctx[5].net_received_amount > 0 && create_if_block_6$5(ctx);
    	let if_block2 = /*item*/ ctx[5].transaction_amount > 0 && create_if_block_5$9(ctx);
    	let if_block3 = /*item*/ ctx[5].overpaid_amount > 0 && create_if_block_4$9(ctx);
    	let if_block4 = /*item*/ ctx[5].installment_amount > 0 && create_if_block_3$a(ctx);
    	let if_block5 = /*item*/ ctx[5].status == 'pending' && create_if_block_2$a(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			span2 = element("span");
    			t7 = text(t7_value);
    			t8 = space();
    			if (if_block3) if_block3.c();
    			t9 = space();
    			if (if_block4) if_block4.c();
    			t10 = space();
    			if (if_block5) if_block5.c();
    			t11 = space();
    			span3 = element("span");
    			span3.textContent = "Pix payment";
    			t13 = space();
    			span4 = element("span");
    			t14 = text(t14_value);
    			t15 = space();
    			span5 = element("span");
    			i = element("i");
    			t16 = space();
    			add_location(span0, file$a, 87, 36, 3888);
    			attr_dev(span1, "class", span1_class_value = "payment-" + /*item*/ ctx[5].status);
    			add_location(span1, file$a, 95, 36, 4290);
    			add_location(span2, file$a, 109, 36, 5055);
    			add_location(span3, file$a, 129, 36, 6240);
    			add_location(span4, file$a, 132, 36, 6382);
    			attr_dev(i, "class", "fas fa-trash");
    			attr_dev(i, "data-id", i_data_id_value = /*item*/ ctx[5].id);
    			add_location(i, file$a, 136, 40, 6577);
    			add_location(span5, file$a, 135, 36, 6529);
    			add_location(p, file$a, 86, 32, 3847);
    			attr_dev(li, "class", "item-editor pix-payment");
    			attr_dev(li, "data-item", li_data_item_value = JSON.stringify(/*item*/ ctx[5]));
    			attr_dev(li, "data-id", li_data_id_value = /*item*/ ctx[5].id);
    			attr_dev(li, "data-purchaseorder", li_data_purchaseorder_value = /*item*/ ctx[5].purchase_order);
    			add_location(li, file$a, 85, 28, 3662);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, span0);
    			append_dev(span0, t0);
    			append_dev(p, t1);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t2);
    			append_dev(p, span1);
    			append_dev(span1, t3);
    			append_dev(p, t4);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t5);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(p, t6);
    			append_dev(p, span2);
    			append_dev(span2, t7);
    			append_dev(p, t8);
    			if (if_block3) if_block3.m(p, null);
    			append_dev(p, t9);
    			if (if_block4) if_block4.m(p, null);
    			append_dev(p, t10);
    			if (if_block5) if_block5.m(p, null);
    			append_dev(p, t11);
    			append_dev(p, span3);
    			append_dev(p, t13);
    			append_dev(p, span4);
    			append_dev(span4, t14);
    			append_dev(p, t15);
    			append_dev(p, span5);
    			append_dev(span5, i);
    			append_dev(li, t16);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i, "click", /*delePixPayment*/ ctx[2], false, false, false),
    					action_destroyer(/*checkPayment*/ ctx[1].call(null, li))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Payments*/ 1 && t0_value !== (t0_value = /*item*/ ctx[5].id + "")) set_data_dev(t0, t0_value);

    			if (/*item*/ ctx[5].first_name) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7$4(ctx);
    					if_block0.c();
    					if_block0.m(p, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*Payments*/ 1 && t3_value !== (t3_value = /*item*/ ctx[5].status + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*Payments*/ 1 && span1_class_value !== (span1_class_value = "payment-" + /*item*/ ctx[5].status)) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (/*item*/ ctx[5].net_received_amount > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_6$5(ctx);
    					if_block1.c();
    					if_block1.m(p, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[5].transaction_amount > 0) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_5$9(ctx);
    					if_block2.c();
    					if_block2.m(p, t6);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*Payments*/ 1 && t7_value !== (t7_value = /*item*/ ctx[5].purchase_order + "")) set_data_dev(t7, t7_value);

    			if (/*item*/ ctx[5].overpaid_amount > 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_4$9(ctx);
    					if_block3.c();
    					if_block3.m(p, t9);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*item*/ ctx[5].installment_amount > 0) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_3$a(ctx);
    					if_block4.c();
    					if_block4.m(p, t10);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*item*/ ctx[5].status == 'pending') {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_2$a(ctx);
    					if_block5.c();
    					if_block5.m(p, t11);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (dirty & /*Payments*/ 1 && t14_value !== (t14_value = /*item*/ ctx[5].createdAt + "")) set_data_dev(t14, t14_value);

    			if (dirty & /*Payments*/ 1 && i_data_id_value !== (i_data_id_value = /*item*/ ctx[5].id)) {
    				attr_dev(i, "data-id", i_data_id_value);
    			}

    			if (dirty & /*Payments*/ 1 && li_data_item_value !== (li_data_item_value = JSON.stringify(/*item*/ ctx[5]))) {
    				attr_dev(li, "data-item", li_data_item_value);
    			}

    			if (dirty & /*Payments*/ 1 && li_data_id_value !== (li_data_id_value = /*item*/ ctx[5].id)) {
    				attr_dev(li, "data-id", li_data_id_value);
    			}

    			if (dirty & /*Payments*/ 1 && li_data_purchaseorder_value !== (li_data_purchaseorder_value = /*item*/ ctx[5].purchase_order)) {
    				attr_dev(li, "data-purchaseorder", li_data_purchaseorder_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$a.name,
    		type: "else",
    		source: "(85:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:24) {#if item.overpaid_amount == undefined}
    function create_if_block_1$a(ctx) {
    	let li;
    	let p;
    	let span0;
    	let t0_value = /*item*/ ctx[5].id + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = /*item*/ ctx[5].display_name + "";
    	let t2;
    	let t3;
    	let span2;
    	let t4_value = /*item*/ ctx[5].status + "";
    	let t4;
    	let span2_class_value;
    	let t5;
    	let span3;
    	let strong;
    	let t6;
    	let t7_value = /*item*/ ctx[5].transaction_amount + "";
    	let t7;
    	let t8;
    	let span4;
    	let t9_value = /*item*/ ctx[5].purchase_order + "";
    	let t9;
    	let t10;
    	let span5;
    	let t11_value = new Date(/*item*/ ctx[5].date_approved).toLocaleDateString() + "";
    	let t11;
    	let t12;
    	let span6;
    	let t13_value = /*item*/ ctx[5].first_six_digits + "";
    	let t13;
    	let t14;
    	let t15_value = /*item*/ ctx[5].last_four_digits + "";
    	let t15;
    	let t16;
    	let span7;
    	let t18;
    	let span8;
    	let t19_value = /*item*/ ctx[5].createdAt + "";
    	let t19;
    	let t20;
    	let span9;
    	let i;
    	let i_data_id_value;
    	let t21;
    	let li_data_item_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span2 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span3 = element("span");
    			strong = element("strong");
    			t6 = text("R$");
    			t7 = text(t7_value);
    			t8 = space();
    			span4 = element("span");
    			t9 = text(t9_value);
    			t10 = space();
    			span5 = element("span");
    			t11 = text(t11_value);
    			t12 = space();
    			span6 = element("span");
    			t13 = text(t13_value);
    			t14 = text("XXXXXX ");
    			t15 = text(t15_value);
    			t16 = space();
    			span7 = element("span");
    			span7.textContent = "Credit Card";
    			t18 = space();
    			span8 = element("span");
    			t19 = text(t19_value);
    			t20 = space();
    			span9 = element("span");
    			i = element("i");
    			t21 = space();
    			add_location(span0, file$a, 50, 36, 1824);
    			add_location(span1, file$a, 53, 36, 1964);
    			attr_dev(span2, "class", span2_class_value = "payment-" + /*item*/ ctx[5].status);
    			add_location(span2, file$a, 56, 36, 2114);
    			add_location(strong, file$a, 60, 40, 2336);
    			add_location(span3, file$a, 59, 36, 2288);
    			add_location(span4, file$a, 64, 36, 2551);
    			add_location(span5, file$a, 67, 36, 2703);
    			add_location(span6, file$a, 70, 36, 2885);
    			add_location(span7, file$a, 73, 36, 3069);
    			add_location(span8, file$a, 76, 36, 3211);
    			attr_dev(i, "class", "fas fa-trash");
    			attr_dev(i, "data-id", i_data_id_value = /*item*/ ctx[5].id);
    			add_location(i, file$a, 80, 40, 3406);
    			add_location(span9, file$a, 79, 36, 3358);
    			add_location(p, file$a, 49, 32, 1783);
    			attr_dev(li, "class", "item-editor");
    			attr_dev(li, "data-item", li_data_item_value = JSON.stringify(/*item*/ ctx[5]));
    			add_location(li, file$a, 48, 28, 1690);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, span0);
    			append_dev(span0, t0);
    			append_dev(p, t1);
    			append_dev(p, span1);
    			append_dev(span1, t2);
    			append_dev(p, t3);
    			append_dev(p, span2);
    			append_dev(span2, t4);
    			append_dev(p, t5);
    			append_dev(p, span3);
    			append_dev(span3, strong);
    			append_dev(strong, t6);
    			append_dev(strong, t7);
    			append_dev(p, t8);
    			append_dev(p, span4);
    			append_dev(span4, t9);
    			append_dev(p, t10);
    			append_dev(p, span5);
    			append_dev(span5, t11);
    			append_dev(p, t12);
    			append_dev(p, span6);
    			append_dev(span6, t13);
    			append_dev(span6, t14);
    			append_dev(span6, t15);
    			append_dev(p, t16);
    			append_dev(p, span7);
    			append_dev(p, t18);
    			append_dev(p, span8);
    			append_dev(span8, t19);
    			append_dev(p, t20);
    			append_dev(p, span9);
    			append_dev(span9, i);
    			append_dev(li, t21);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*deletePayment*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Payments*/ 1 && t0_value !== (t0_value = /*item*/ ctx[5].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*Payments*/ 1 && t2_value !== (t2_value = /*item*/ ctx[5].display_name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*Payments*/ 1 && t4_value !== (t4_value = /*item*/ ctx[5].status + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*Payments*/ 1 && span2_class_value !== (span2_class_value = "payment-" + /*item*/ ctx[5].status)) {
    				attr_dev(span2, "class", span2_class_value);
    			}

    			if (dirty & /*Payments*/ 1 && t7_value !== (t7_value = /*item*/ ctx[5].transaction_amount + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*Payments*/ 1 && t9_value !== (t9_value = /*item*/ ctx[5].purchase_order + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*Payments*/ 1 && t11_value !== (t11_value = new Date(/*item*/ ctx[5].date_approved).toLocaleDateString() + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*Payments*/ 1 && t13_value !== (t13_value = /*item*/ ctx[5].first_six_digits + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*Payments*/ 1 && t15_value !== (t15_value = /*item*/ ctx[5].last_four_digits + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*Payments*/ 1 && t19_value !== (t19_value = /*item*/ ctx[5].createdAt + "")) set_data_dev(t19, t19_value);

    			if (dirty & /*Payments*/ 1 && i_data_id_value !== (i_data_id_value = /*item*/ ctx[5].id)) {
    				attr_dev(i, "data-id", i_data_id_value);
    			}

    			if (dirty & /*Payments*/ 1 && li_data_item_value !== (li_data_item_value = JSON.stringify(/*item*/ ctx[5]))) {
    				attr_dev(li, "data-item", li_data_item_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$a.name,
    		type: "if",
    		source: "(48:24) {#if item.overpaid_amount == undefined}",
    		ctx
    	});

    	return block;
    }

    // (91:36) {#if item.first_name}
    function create_if_block_7$4(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[5].first_name + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$a, 91, 40, 4091);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Payments*/ 1 && t_value !== (t_value = /*item*/ ctx[5].first_name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$4.name,
    		type: "if",
    		source: "(91:36) {#if item.first_name}",
    		ctx
    	});

    	return block;
    }

    // (100:36) {#if item.net_received_amount > 0}
    function create_if_block_6$5(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[5].net_received_amount + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$a, 100, 40, 4543);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Payments*/ 1 && t_value !== (t_value = /*item*/ ctx[5].net_received_amount + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$5.name,
    		type: "if",
    		source: "(100:36) {#if item.net_received_amount > 0}",
    		ctx
    	});

    	return block;
    }

    // (105:36) {#if item.transaction_amount > 0}
    function create_if_block_5$9(ctx) {
    	let span;
    	let strong;
    	let t0;
    	let t1_value = /*item*/ ctx[5].transaction_amount + "";
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			strong = element("strong");
    			t0 = text("R$");
    			t1 = text(t1_value);
    			add_location(strong, file$a, 106, 44, 4878);
    			add_location(span, file$a, 105, 40, 4826);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, strong);
    			append_dev(strong, t0);
    			append_dev(strong, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Payments*/ 1 && t1_value !== (t1_value = /*item*/ ctx[5].transaction_amount + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$9.name,
    		type: "if",
    		source: "(105:36) {#if item.transaction_amount > 0}",
    		ctx
    	});

    	return block;
    }

    // (113:36) {#if item.overpaid_amount > 0}
    function create_if_block_4$9(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[5].overpaid_amount + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$a, 113, 40, 5279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Payments*/ 1 && t_value !== (t_value = /*item*/ ctx[5].overpaid_amount + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$9.name,
    		type: "if",
    		source: "(113:36) {#if item.overpaid_amount > 0}",
    		ctx
    	});

    	return block;
    }

    // (118:36) {#if item.installment_amount > 0}
    function create_if_block_3$a(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[5].installment_amount + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$a, 118, 40, 5558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Payments*/ 1 && t_value !== (t_value = /*item*/ ctx[5].installment_amount + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$a.name,
    		type: "if",
    		source: "(118:36) {#if item.installment_amount > 0}",
    		ctx
    	});

    	return block;
    }

    // (123:36) {#if item.status == 'pending'}
    function create_if_block_2$a(ctx) {
    	let span;
    	let img;
    	let img_src_value;
    	let t0;
    	let br;
    	let t1;
    	let t2_value = /*item*/ ctx[5].qr_code + "";
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			img = element("img");
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			t2 = text(t2_value);
    			set_style(img, "width", "250px");
    			set_style(img, "margin", "15px");
    			if (!src_url_equal(img.src, img_src_value = "data:image/jpeg;charset=utf-8;base64, " + /*item*/ ctx[5].qr_code_base64)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$a, 124, 44, 5889);
    			add_location(br, file$a, 125, 44, 6046);
    			add_location(span, file$a, 123, 40, 5837);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, img);
    			append_dev(span, t0);
    			append_dev(span, br);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Payments*/ 1 && !src_url_equal(img.src, img_src_value = "data:image/jpeg;charset=utf-8;base64, " + /*item*/ ctx[5].qr_code_base64)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*Payments*/ 1 && t2_value !== (t2_value = /*item*/ ctx[5].qr_code + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$a.name,
    		type: "if",
    		source: "(123:36) {#if item.status == 'pending'}",
    		ctx
    	});

    	return block;
    }

    // (47:20) {#each Payments as item, i}
    function create_each_block$9(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[5].overpaid_amount == undefined) return create_if_block_1$a;
    		return create_else_block$a;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(47:20) {#each Payments as item, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let i;
    	let t0;
    	let div2;
    	let ul;
    	let t1;
    	let if_block0 = /*Payments*/ ctx[0].length <= 0 && create_if_block_8$2(ctx);
    	let if_block1 = /*Payments*/ ctx[0].length >= 1 && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			div2 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(i, "class", "fas fa-list");
    			add_location(i, file$a, 3, 12, 110);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$a, 2, 8, 73);
    			attr_dev(div1, "class", "actions");
    			add_location(div1, file$a, 1, 4, 42);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$a, 7, 8, 214);
    			attr_dev(div2, "class", "list-inside-content");
    			add_location(div2, file$a, 6, 4, 171);
    			attr_dev(div3, "class", "content payment-editor");
    			add_location(div3, file$a, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t1);
    			if (if_block1) if_block1.m(ul, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*Payments*/ ctx[0].length <= 0) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_8$2(ctx);
    					if_block0.c();
    					if_block0.m(ul, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*Payments*/ ctx[0].length >= 1) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Payment', slots, []);
    	let Payments = [];

    	onMount(async () => {
    		checkLogged();
    		feedUpdate();
    	});

    	const feedUpdate = async () => {
    		startRestLoading();
    		const res = await startARest('/history/payments', 'GET', null);

    		res != undefined
    		? $$invalidate(0, Payments = res[0].getPayments)
    		: Payment = 'Pagamentos não efetuados';

    		res != undefined
    		? setNewNotification('Pagamentos carregados com sucesso!', 'success')
    		: '';
    	};

    	const checkPayment = async e => {
    		//listPayments.push({ id:e.dataset.id, purchase_order:e.dataset.purchaseorder });
    		let json = {
    			purchase_order: e.dataset.purchaseorder,
    			id: e.dataset.id
    		};

    		await startARest('/update/pix/status', 'POST', json);
    	};

    	const delePixPayment = async e => {
    		await startARest(`/payment/pix/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const deletePayment = async e => {
    		await startARest(`/payment/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Payment> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		setNewNotification,
    		startRestLoading,
    		checkLogged,
    		Payments,
    		feedUpdate,
    		checkPayment,
    		delePixPayment,
    		deletePayment
    	});

    	$$self.$inject_state = $$props => {
    		if ('Payments' in $$props) $$invalidate(0, Payments = $$props.Payments);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [Payments, checkPayment, delePixPayment, deletePayment];
    }

    class Payment_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Payment_1",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\editors\Codes.svelte generated by Svelte v3.46.2 */

    function create_fragment$a(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Codes");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Codes', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Codes> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Codes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Codes",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\editors\Skills.svelte generated by Svelte v3.46.2 */

    const { document: document_1 } = globals;

    const file$9 = "src\\editors\\Skills.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (40:16) {#if typeof Skills == 'string'}
    function create_if_block_5$8(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Skills*/ ctx[1]);
    			add_location(h3, file$9, 40, 16, 1647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Skills*/ 2) set_data_dev(t, /*Skills*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$8.name,
    		type: "if",
    		source: "(40:16) {#if typeof Skills == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (46:12) {#if typeof Skills != 'string'}
    function create_if_block_1$9(ctx) {
    	let each_1_anchor;
    	let each_value = /*Skills*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Skills, deleteSkill, handleEditValue*/ 2178) {
    				each_value = /*Skills*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$9.name,
    		type: "if",
    		source: "(46:12) {#if typeof Skills != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (50:28) {#if item.stack}
    function create_if_block_4$8(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[20].stack + "";
    	let t;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "stack");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[20].id);
    			add_location(span, file$9, 50, 32, 1970);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Skills*/ 2 && t_value !== (t_value = /*item*/ ctx[20].stack + "")) set_data_dev(t, t_value);

    			if (dirty & /*Skills*/ 2 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[20].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$8.name,
    		type: "if",
    		source: "(50:28) {#if item.stack}",
    		ctx
    	});

    	return block;
    }

    // (55:28) {#if item.stackvalues}
    function create_if_block_3$9(ctx) {
    	let span;
    	let span_data_stackvalues_value;
    	let each_value_2 = /*item*/ ctx[20].stackvalues.split(',');
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			span = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "stackvalue");
    			attr_dev(span, "data-stackvalues", span_data_stackvalues_value = /*item*/ ctx[20].stackvalues);
    			add_location(span, file$9, 55, 32, 2220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Skills*/ 2) {
    				each_value_2 = /*item*/ ctx[20].stackvalues.split(',');
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty & /*Skills*/ 2 && span_data_stackvalues_value !== (span_data_stackvalues_value = /*item*/ ctx[20].stackvalues)) {
    				attr_dev(span, "data-stackvalues", span_data_stackvalues_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$9.name,
    		type: "if",
    		source: "(55:28) {#if item.stackvalues}",
    		ctx
    	});

    	return block;
    }

    // (57:36) {#each item.stackvalues.split(',') as stackvalue }
    function create_each_block_2(ctx) {
    	let span;
    	let t0_value = /*stackvalue*/ ctx[26] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "tag-know");
    			add_location(span, file$9, 57, 40, 2411);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Skills*/ 2 && t0_value !== (t0_value = /*stackvalue*/ ctx[26] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(57:36) {#each item.stackvalues.split(',') as stackvalue }",
    		ctx
    	});

    	return block;
    }

    // (64:28) {#if item.stackTime}
    function create_if_block_2$9(ctx) {
    	let span;
    	let span_data_stacktime_value;
    	let each_value_1 = /*item*/ ctx[20].stackTime.split(',');
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			span = element("span");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "stacktime");
    			attr_dev(span, "data-stacktime", span_data_stacktime_value = /*item*/ ctx[20].stackTime);
    			add_location(span, file$9, 64, 32, 2746);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(span, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Skills*/ 2) {
    				each_value_1 = /*item*/ ctx[20].stackTime.split(',');
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(span, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*Skills*/ 2 && span_data_stacktime_value !== (span_data_stacktime_value = /*item*/ ctx[20].stackTime)) {
    				attr_dev(span, "data-stacktime", span_data_stacktime_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$9.name,
    		type: "if",
    		source: "(64:28) {#if item.stackTime}",
    		ctx
    	});

    	return block;
    }

    // (66:36) {#each item.stackTime.split(',') as stacktime}
    function create_each_block_1$2(ctx) {
    	let span;
    	let t0_value = /*stacktime*/ ctx[23] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "tag-skilly");
    			add_location(span, file$9, 66, 40, 2928);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Skills*/ 2 && t0_value !== (t0_value = /*stacktime*/ ctx[23] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(66:36) {#each item.stackTime.split(',') as stacktime}",
    		ctx
    	});

    	return block;
    }

    // (47:16) {#each Skills as item, key}
    function create_each_block$8(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let div;
    	let i0;
    	let t3;
    	let i1;
    	let i1_data_id_value;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[20].stack && create_if_block_4$8(ctx);
    	let if_block1 = /*item*/ ctx[20].stackvalues && create_if_block_3$9(ctx);
    	let if_block2 = /*item*/ ctx[20].stackTime && create_if_block_2$9(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div = element("div");
    			i0 = element("i");
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			add_location(p, file$9, 48, 24, 1887);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$9, 74, 28, 3294);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[20].id);
    			add_location(i1, file$9, 75, 28, 3380);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$9, 73, 24, 3236);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$9, 47, 20, 1837);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(li, t2);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t3);
    			append_dev(div, i1);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[11], false, false, false),
    					listen_dev(i1, "click", /*deleteSkill*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[20].stack) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$8(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[20].stackvalues) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$9(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[20].stackTime) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$9(ctx);
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*Skills*/ 2 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[20].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(47:16) {#each Skills as item, key}",
    		ctx
    	});

    	return block;
    }

    // (86:8) {:else}
    function create_else_block$9(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$9, 86, 12, 3740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateSkill*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$9.name,
    		type: "else",
    		source: "(86:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:8) {#if editorCreated}
    function create_if_block$9(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$9, 84, 12, 3646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createSkill*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(84:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let script;
    	let script_src_value;
    	let t0;
    	let div11;
    	let div2;
    	let div0;
    	let i0;
    	let t1;
    	let div1;
    	let p;
    	let t3;
    	let i1;
    	let t4;
    	let div4;
    	let div3;
    	let t5;
    	let div5;
    	let t6;
    	let div10;
    	let div9;
    	let div7;
    	let div6;
    	let label0;
    	let t8;
    	let input0;
    	let t9;
    	let label1;
    	let t10;
    	let span0;
    	let t11;
    	let input1;
    	let t12;
    	let label2;
    	let t13;
    	let span1;
    	let t14;
    	let input2;
    	let t15;
    	let div8;
    	let t16;
    	let t17;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Skills*/ ctx[1] == 'string' && create_if_block_5$8(ctx);
    	let if_block1 = typeof /*Skills*/ ctx[1] != 'string' && create_if_block_1$9(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[0]) return create_if_block$9;
    		return create_else_block$9;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			script = element("script");
    			t0 = space();
    			div11 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t1 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t5 = space();
    			div5 = element("div");
    			t6 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			label0 = element("label");
    			label0.textContent = "Tecnologia";
    			t8 = space();
    			input0 = element("input");
    			t9 = space();
    			label1 = element("label");
    			t10 = text("Tempo de desenvolvimento ");
    			span0 = element("span");
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			label2 = element("label");
    			t13 = text("Conhecimento Tecnologia % ");
    			span1 = element("span");
    			t14 = space();
    			input2 = element("input");
    			t15 = space();
    			div8 = element("div");
    			if (if_block0) if_block0.c();
    			t16 = space();
    			if (if_block1) if_block1.c();
    			t17 = space();
    			if_block2.c();
    			if (!src_url_equal(script.src, script_src_value = "https://unpkg.com/frappe-charts@latest")) attr_dev(script, "src", script_src_value);
    			add_location(script, file$9, 1, 4, 19);
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$9, 8, 12, 212);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$9, 7, 8, 175);
    			add_location(p, file$9, 11, 12, 329);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$9, 14, 12, 387);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$9, 10, 8, 265);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$9, 6, 4, 144);
    			attr_dev(div3, "id", "frost-chart");
    			add_location(div3, file$9, 18, 8, 489);
    			attr_dev(div4, "class", "chart-controller");
    			add_location(div4, file$9, 17, 4, 449);
    			attr_dev(div5, "class", "divider");
    			add_location(div5, file$9, 20, 4, 535);
    			attr_dev(label0, "for", "stack");
    			add_location(label0, file$9, 29, 20, 877);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "stack");
    			attr_dev(input0, "id", "stack");
    			add_location(input0, file$9, 30, 20, 936);
    			attr_dev(span0, "class", "yearcreated");
    			add_location(span0, file$9, 31, 64, 1071);
    			attr_dev(label1, "for", "anos");
    			add_location(label1, file$9, 31, 20, 1027);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "anos");
    			attr_dev(input1, "id", "anos");
    			add_location(input1, file$9, 32, 20, 1135);
    			attr_dev(span1, "class", "hightlited-year");
    			add_location(span1, file$9, 33, 89, 1318);
    			attr_dev(label2, "for", "valuestack");
    			attr_dev(label2, "class", "highlited");
    			add_location(label2, file$9, 33, 20, 1249);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "valuestack");
    			attr_dev(input2, "id", "valuestack");
    			add_location(input2, file$9, 34, 20, 1387);
    			attr_dev(div6, "class", "input-control");
    			add_location(div6, file$9, 28, 16, 828);
    			attr_dev(div7, "class", "limiter-inputs");
    			add_location(div7, file$9, 27, 12, 782);
    			attr_dev(div8, "class", "list-skills");
    			add_location(div8, file$9, 38, 12, 1555);
    			attr_dev(div9, "class", "two-content");
    			add_location(div9, file$9, 26, 8, 743);
    			attr_dev(div10, "class", "content-creator");
    			add_location(div10, file$9, 21, 4, 568);
    			attr_dev(div11, "class", "content skills-editor");
    			add_location(div11, file$9, 5, 0, 103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, script);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t3);
    			append_dev(div1, i1);
    			append_dev(div11, t4);
    			append_dev(div11, div4);
    			append_dev(div4, div3);
    			append_dev(div11, t5);
    			append_dev(div11, div5);
    			append_dev(div11, t6);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div7, div6);
    			append_dev(div6, label0);
    			append_dev(div6, t8);
    			append_dev(div6, input0);
    			set_input_value(input0, /*stackdevelop*/ ctx[2]);
    			append_dev(div6, t9);
    			append_dev(div6, label1);
    			append_dev(label1, t10);
    			append_dev(label1, span0);
    			append_dev(div6, t11);
    			append_dev(div6, input1);
    			set_input_value(input1, /*timedevelop*/ ctx[4]);
    			append_dev(div6, t12);
    			append_dev(div6, label2);
    			append_dev(label2, t13);
    			append_dev(label2, span1);
    			append_dev(div6, t14);
    			append_dev(div6, input2);
    			set_input_value(input2, /*knowdevelop*/ ctx[3]);
    			append_dev(div9, t15);
    			append_dev(div9, div8);
    			if (if_block0) if_block0.m(div8, null);
    			append_dev(div8, t16);
    			if (if_block1) if_block1.m(div8, null);
    			append_dev(div10, t17);
    			if_block2.m(div10, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[8], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[12]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[13]),
    					listen_dev(input1, "keyup", /*createListYear*/ ctx[9], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[14]),
    					listen_dev(input2, "keyup", /*highlightYear*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*stackdevelop*/ 4 && input0.value !== /*stackdevelop*/ ctx[2]) {
    				set_input_value(input0, /*stackdevelop*/ ctx[2]);
    			}

    			if (dirty & /*timedevelop*/ 16 && input1.value !== /*timedevelop*/ ctx[4]) {
    				set_input_value(input1, /*timedevelop*/ ctx[4]);
    			}

    			if (dirty & /*knowdevelop*/ 8 && input2.value !== /*knowdevelop*/ ctx[3]) {
    				set_input_value(input2, /*knowdevelop*/ ctx[3]);
    			}

    			if (typeof /*Skills*/ ctx[1] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$8(ctx);
    					if_block0.c();
    					if_block0.m(div8, t16);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Skills*/ ctx[1] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$9(ctx);
    					if_block1.c();
    					if_block1.m(div8, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div10, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(script);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div11);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skills', slots, []);
    	let editorCreated = true;
    	let YearSkill = [];
    	let KnowledgeSkill = [];
    	let Skills = [];
    	let stackdevelop;
    	let knowdevelop;
    	let timedevelop;
    	let identifier;

    	onMount(async () => {
    		checkLogged();
    		feedUpdate();
    	});

    	const feedUpdate = async () => {
    		startRestLoading();
    		const res = await startARest('/skill', 'GET', null);

    		if (res != undefined) {
    			$$invalidate(1, Skills = res[0].getSkills);
    			setNewNotification('Habilidades carregadas com sucesso!', 'success');
    			initializeRemarkable(Skills);
    		} else {
    			$$invalidate(1, Skills = 'Skills não cadastradas');
    		}
    	};

    	const createSkill = async () => {
    		let json = {
    			stack: stackdevelop,
    			stackvalues: knowdevelop,
    			stacktime: timedevelop
    		};

    		await startARest('/skill/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			800
    		);
    	}; //setNewNotification('Habilidade cadastrada', 'success');

    	const updateSkill = () => {
    		let json = {
    			stack: stackdevelop,
    			stackvalues: knowdevelop,
    			stacktime: timedevelop
    		};

    		startARest(`/skill/update/${identifier}`, 'PUT', json);
    		setNewNotification('Habilidade atualizada', 'success');

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			800
    		);
    	};

    	const deleteSkill = async e => {
    		await startARest(`/skill/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			800
    		);
    	}; //setNewNotification('Habilidade deletada', 'success');

    	const startEditor = e => {
    		$$invalidate(2, stackdevelop = '');
    		$$invalidate(3, knowdevelop = '');
    		$$invalidate(4, timedevelop = '');
    		YearSkill = [];
    		$$invalidate(0, editorCreated = true);
    	};

    	const createListYear = e => {
    		let yskill = e.target.value;

    		if (yskill.length >= 4) {
    			let treat = yskill.split(',');

    			treat.forEach(tskillyear => {
    				if (tskillyear.length >= 4) {
    					if (YearSkill.includes(tskillyear) === false) {
    						YearSkill.push(tskillyear);
    					}
    				}
    			});
    		} else {
    			YearSkill = [];
    		}
    	};

    	const highlightYear = e => {
    		let skillValue = e.target.value;
    		let treat = skillValue.split(',');
    		let hightlitedYear = document.querySelector('.hightlited-year');

    		if (e.target.value != 0) {
    			if (YearSkill[treat.length - 1] != undefined) {
    				hightlitedYear.innerHTML = `<span class="inside" > ${YearSkill[treat.length - 1]} </span>`;
    			} else {
    				hightlitedYear.innerHTML = '<span class="inside error" >Ano não cadastrado, por favor cadastre</span>';
    			}
    		} else {
    			if (YearSkill[0] != undefined) {
    				hightlitedYear.innerHTML = `<span class="inside" > ${YearSkill[0]} </span>`;
    			} else {
    				hightlitedYear.innerHTML = '<span class="inside error" >Ano não cadastrado, por favor cadastre</span>';
    			}
    		}
    	};

    	const handleEditValue = e => {
    		identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		$$invalidate(2, stackdevelop = e.target.parentElement.parentElement.children[0].children[0].innerHTML);
    		$$invalidate(3, knowdevelop = e.target.parentElement.parentElement.children[0].children[1].dataset.stackvalues);
    		$$invalidate(4, timedevelop = e.target.parentElement.parentElement.children[0].children[2].dataset.stacktime);
    		$$invalidate(0, editorCreated = false);
    	};

    	const initializeRemarkable = async skills => {
    		let sets = [];
    		let checkMaxTime = [];
    		let getBiggestDate;

    		skills.forEach(skill => {
    			let getLengthTime = skill.stackTime.split(',');
    			let stackValuesr = skill.stackvalues.split(',');
    			YearSkill = getLengthTime;
    			$$invalidate(4, timedevelop = YearSkill.join(','));
    			KnowledgeSkill = stackValuesr;

    			checkMaxTime.push({
    				time: getLengthTime.length,
    				value: getLengthTime
    			});

    			sets.push({ name: skill.stack, values: stackValuesr });
    		});

    		let getBig = Math.max.apply(Math, checkMaxTime.map(biggest => biggest.time));

    		checkMaxTime.map(bigger => {
    			if (getBig == bigger.value.length) {
    				getBiggestDate = bigger.value;
    			}
    		});

    		new frappe.Chart("#frost-chart",
    		{
    				data: {
    					labels: getBiggestDate,
    					datasets: sets,
    					yMarkers: [
    						{
    							label: " ",
    							value: 100,
    							options: { labelPos: 'left' }, // default: 'right'
    							
    						}
    					]
    				},
    				lineOptions: {
    					regionFill: 0, // default: 0
    					
    				},
    				title: "Skills Cadastradas",
    				type: 'line', // or 'bar', 'line', 'pie', 'percentage'
    				height: 300,
    				colors: ['#ffa3ef', '#2a2a2a', '#8a00f2', '#fffb00', '#37f89b', '#ff1465'],
    				tooltipOptions: {
    					formatTooltipX: d => (d + '').toUpperCase(),
    					formatTooltipY: d => d + ' '
    				}
    			});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		stackdevelop = this.value;
    		$$invalidate(2, stackdevelop);
    	}

    	function input1_input_handler() {
    		timedevelop = this.value;
    		$$invalidate(4, timedevelop);
    	}

    	function input2_input_handler() {
    		knowdevelop = this.value;
    		$$invalidate(3, knowdevelop);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		checkLogged,
    		editorCreated,
    		YearSkill,
    		KnowledgeSkill,
    		Skills,
    		stackdevelop,
    		knowdevelop,
    		timedevelop,
    		identifier,
    		feedUpdate,
    		createSkill,
    		updateSkill,
    		deleteSkill,
    		startEditor,
    		createListYear,
    		highlightYear,
    		handleEditValue,
    		initializeRemarkable
    	});

    	$$self.$inject_state = $$props => {
    		if ('editorCreated' in $$props) $$invalidate(0, editorCreated = $$props.editorCreated);
    		if ('YearSkill' in $$props) YearSkill = $$props.YearSkill;
    		if ('KnowledgeSkill' in $$props) KnowledgeSkill = $$props.KnowledgeSkill;
    		if ('Skills' in $$props) $$invalidate(1, Skills = $$props.Skills);
    		if ('stackdevelop' in $$props) $$invalidate(2, stackdevelop = $$props.stackdevelop);
    		if ('knowdevelop' in $$props) $$invalidate(3, knowdevelop = $$props.knowdevelop);
    		if ('timedevelop' in $$props) $$invalidate(4, timedevelop = $$props.timedevelop);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		editorCreated,
    		Skills,
    		stackdevelop,
    		knowdevelop,
    		timedevelop,
    		createSkill,
    		updateSkill,
    		deleteSkill,
    		startEditor,
    		createListYear,
    		highlightYear,
    		handleEditValue,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class Skills_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills_1",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\editors\Leads.svelte generated by Svelte v3.46.2 */
    const file$8 = "src\\editors\\Leads.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Titles == 'string'}
    function create_if_block_6$4(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Titles*/ ctx[5]);
    			add_location(h3, file$8, 16, 16, 477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32) set_data_dev(t, /*Titles*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$4.name,
    		type: "if",
    		source: "(16:12) {#if typeof Titles == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Titles != 'string'}
    function create_if_block_1$8(ctx) {
    	let each_1_anchor;
    	let each_value = /*Titles*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles, deleteWord, handleEditValue*/ 1312) {
    				each_value = /*Titles*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(22:12) {#if typeof Titles != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (26:28) {#if item.devName}
    function create_if_block_5$7(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].devName + "";
    	let t;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "devName");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[17].id);
    			add_location(span, file$8, 26, 32, 802);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[17].devName + "")) set_data_dev(t, t_value);

    			if (dirty & /*Titles*/ 32 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[17].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$7.name,
    		type: "if",
    		source: "(26:28) {#if item.devName}",
    		ctx
    	});

    	return block;
    }

    // (31:28) {#if item.devEmail}
    function create_if_block_4$7(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].devEmail + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "devEmail");
    			add_location(span, file$8, 31, 32, 1053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[17].devEmail + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$7.name,
    		type: "if",
    		source: "(31:28) {#if item.devEmail}",
    		ctx
    	});

    	return block;
    }

    // (36:28) {#if item.devDiscord}
    function create_if_block_3$8(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].devDiscord + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "devDiscord");
    			add_location(span, file$8, 36, 32, 1290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[17].devDiscord + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$8.name,
    		type: "if",
    		source: "(36:28) {#if item.devDiscord}",
    		ctx
    	});

    	return block;
    }

    // (41:28) {#if item.rankingPoints >= 0}
    function create_if_block_2$8(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].rankingPoints + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "rankingPoints");
    			add_location(span, file$8, 41, 32, 1539);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[17].rankingPoints + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$8.name,
    		type: "if",
    		source: "(41:28) {#if item.rankingPoints >= 0}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Titles as item, key}
    function create_each_block$7(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div;
    	let i0;
    	let t4;
    	let i1;
    	let i1_data_id_value;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[17].devName && create_if_block_5$7(ctx);
    	let if_block1 = /*item*/ ctx[17].devEmail && create_if_block_4$7(ctx);
    	let if_block2 = /*item*/ ctx[17].devDiscord && create_if_block_3$8(ctx);
    	let if_block3 = /*item*/ ctx[17].rankingPoints >= 0 && create_if_block_2$8(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			div = element("div");
    			i0 = element("i");
    			t4 = space();
    			i1 = element("i");
    			t5 = space();
    			add_location(p, file$8, 24, 24, 717);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$8, 47, 28, 1815);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[17].id);
    			add_location(i1, file$8, 48, 28, 1901);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$8, 46, 24, 1757);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$8, 23, 20, 667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(p, t2);
    			if (if_block3) if_block3.m(p, null);
    			append_dev(li, t3);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t4);
    			append_dev(div, i1);
    			append_dev(li, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*deleteWord*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[17].devName) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$7(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[17].devEmail) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4$7(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[17].devDiscord) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3$8(ctx);
    					if_block2.c();
    					if_block2.m(p, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*item*/ ctx[17].rankingPoints >= 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2$8(ctx);
    					if_block3.c();
    					if_block3.m(p, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*Titles*/ 32 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[17].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(23:16) {#each Titles as item, key}",
    		ctx
    	});

    	return block;
    }

    // (74:8) {:else}
    function create_else_block$8(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$8, 74, 12, 2876);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateWord*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(74:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (72:8) {#if editorCreated}
    function create_if_block$8(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$8, 72, 12, 2783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createWord*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(72:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div8;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div7;
    	let div6;
    	let div5;
    	let input0;
    	let t7;
    	let input1;
    	let t8;
    	let input2;
    	let t9;
    	let input3;
    	let t10;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Titles*/ ctx[5] == 'string' && create_if_block_6$4(ctx);
    	let if_block1 = typeof /*Titles*/ ctx[5] != 'string' && create_if_block_1$8(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[4]) return create_if_block$8;
    		return create_else_block$8;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			input0 = element("input");
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			input2 = element("input");
    			t9 = space();
    			input3 = element("input");
    			t10 = space();
    			if_block2.c();
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$8, 3, 12, 107);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$8, 2, 8, 70);
    			add_location(p, file$8, 6, 12, 224);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$8, 9, 12, 282);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$8, 5, 8, 160);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$8, 1, 4, 39);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$8, 13, 8, 387);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$8, 12, 4, 344);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$8, 56, 4, 2111);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "name");
    			attr_dev(input0, "placeholder", "Nome de desenvolvedor");
    			add_location(input0, file$8, 61, 16, 2269);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "email");
    			attr_dev(input1, "placeholder", "Email de desenvolvedor");
    			add_location(input1, file$8, 62, 16, 2378);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "discord");
    			attr_dev(input2, "placeholder", "Discord de desenvolvedor");
    			add_location(input2, file$8, 63, 16, 2488);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", "points");
    			attr_dev(input3, "placeholder", "Quantidade de pontos");
    			add_location(input3, file$8, 64, 16, 2604);
    			attr_dev(div5, "class", "input-control");
    			add_location(div5, file$8, 60, 12, 2224);
    			attr_dev(div6, "class", "four-inputs");
    			add_location(div6, file$8, 59, 8, 2185);
    			attr_dev(div7, "class", "content-creator");
    			add_location(div7, file$8, 57, 4, 2144);
    			attr_dev(div8, "class", "content word-editor");
    			add_location(div8, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div8, t3);
    			append_dev(div8, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div8, t5);
    			append_dev(div8, div4);
    			append_dev(div8, t6);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, input0);
    			set_input_value(input0, /*devName*/ ctx[0]);
    			append_dev(div5, t7);
    			append_dev(div5, input1);
    			set_input_value(input1, /*devEmail*/ ctx[1]);
    			append_dev(div5, t8);
    			append_dev(div5, input2);
    			set_input_value(input2, /*devDiscord*/ ctx[2]);
    			append_dev(div5, t9);
    			append_dev(div5, input3);
    			set_input_value(input3, /*devPoints*/ ctx[3]);
    			append_dev(div7, t10);
    			if_block2.m(div7, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[9], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Titles*/ ctx[5] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$4(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Titles*/ ctx[5] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$8(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*devName*/ 1 && input0.value !== /*devName*/ ctx[0]) {
    				set_input_value(input0, /*devName*/ ctx[0]);
    			}

    			if (dirty & /*devEmail*/ 2 && input1.value !== /*devEmail*/ ctx[1]) {
    				set_input_value(input1, /*devEmail*/ ctx[1]);
    			}

    			if (dirty & /*devDiscord*/ 4 && input2.value !== /*devDiscord*/ ctx[2]) {
    				set_input_value(input2, /*devDiscord*/ ctx[2]);
    			}

    			if (dirty & /*devPoints*/ 8 && input3.value !== /*devPoints*/ ctx[3]) {
    				set_input_value(input3, /*devPoints*/ ctx[3]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div7, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Leads', slots, []);
    	let devName, devEmail, devDiscord, devPoints;
    	let editorCreated = true;
    	let identifier = null;
    	let Titles = [];

    	onMount(async () => {
    		checkLogged();
    		await feedUpdate();
    	});

    	const feedUpdate = async () => {
    		//startRestLoading();
    		const res = await startARest('/lead', 'GET');

    		if (res != undefined) {
    			$$invalidate(5, Titles = res[0].getLeads);
    			setNewNotification('Leads carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(5, Titles = 'Sem itens');
    		}

    		rollDown();
    	};

    	const createWord = async () => {
    		let json = {
    			name: devName,
    			email: devEmail,
    			discord: devDiscord,
    			points: Number(devPoints)
    		};

    		await startARest('/lead/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const updateWord = async () => {
    		let json = {
    			name: devName,
    			email: devEmail,
    			discord: devDiscord,
    			points: devPoints
    		};

    		await startARest(`/lead/update/${identifier}`, 'PUT', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			550
    		);
    	};

    	const deleteWord = async e => {
    		await startARest(`/lead/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const startEditor = e => {
    		$$invalidate(4, editorCreated = true);
    	};

    	const handleEditValue = e => {
    		identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		$$invalidate(0, devName = e.target.parentElement.parentElement.children[0].children[0].innerHTML);
    		$$invalidate(1, devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML);
    		$$invalidate(2, devDiscord = e.target.parentElement.parentElement.children[0].children[2].innerHTML);
    		$$invalidate(3, devPoints = e.target.parentElement.parentElement.children[0].children[3].innerHTML);
    		$$invalidate(4, editorCreated = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Leads> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		devName = this.value;
    		$$invalidate(0, devName);
    	}

    	function input1_input_handler() {
    		devEmail = this.value;
    		$$invalidate(1, devEmail);
    	}

    	function input2_input_handler() {
    		devDiscord = this.value;
    		$$invalidate(2, devDiscord);
    	}

    	function input3_input_handler() {
    		devPoints = this.value;
    		$$invalidate(3, devPoints);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		getCookie,
    		checkLogged,
    		rollDown,
    		devName,
    		devEmail,
    		devDiscord,
    		devPoints,
    		editorCreated,
    		identifier,
    		Titles,
    		feedUpdate,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('devName' in $$props) $$invalidate(0, devName = $$props.devName);
    		if ('devEmail' in $$props) $$invalidate(1, devEmail = $$props.devEmail);
    		if ('devDiscord' in $$props) $$invalidate(2, devDiscord = $$props.devDiscord);
    		if ('devPoints' in $$props) $$invalidate(3, devPoints = $$props.devPoints);
    		if ('editorCreated' in $$props) $$invalidate(4, editorCreated = $$props.editorCreated);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    		if ('Titles' in $$props) $$invalidate(5, Titles = $$props.Titles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		devName,
    		devEmail,
    		devDiscord,
    		devPoints,
    		editorCreated,
    		Titles,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	];
    }

    class Leads extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Leads",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\editors\Quests.svelte generated by Svelte v3.46.2 */
    const file$7 = "src\\editors\\Quests.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Titles == 'string'}
    function create_if_block_7$3(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Titles*/ ctx[5]);
    			add_location(h3, file$7, 16, 16, 483);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32) set_data_dev(t, /*Titles*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$3.name,
    		type: "if",
    		source: "(16:12) {#if typeof Titles == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Titles != 'string'}
    function create_if_block_1$7(ctx) {
    	let each_1_anchor;
    	let each_value = /*Titles*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles, deleteWord, handleEditValue*/ 2592) {
    				each_value = /*Titles*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(22:12) {#if typeof Titles != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (26:28) {#if item.title}
    function create_if_block_6$3(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[19].title + "";
    	let t;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "title");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[19].id);
    			add_location(span, file$7, 26, 32, 806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[19].title + "")) set_data_dev(t, t_value);

    			if (dirty & /*Titles*/ 32 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[19].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$3.name,
    		type: "if",
    		source: "(26:28) {#if item.title}",
    		ctx
    	});

    	return block;
    }

    // (31:28) {#if item.price}
    function create_if_block_5$6(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[19].price + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "price");
    			add_location(span, file$7, 31, 32, 1050);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[19].price + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$6.name,
    		type: "if",
    		source: "(31:28) {#if item.price}",
    		ctx
    	});

    	return block;
    }

    // (36:28) {#if item.description}
    function create_if_block_4$6(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[19].description + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "description");
    			add_location(span, file$7, 36, 32, 1282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[19].description + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$6.name,
    		type: "if",
    		source: "(36:28) {#if item.description}",
    		ctx
    	});

    	return block;
    }

    // (41:28) {#if item.questPoint >= 0}
    function create_if_block_3$7(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[19].questPoint + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "questPoint");
    			add_location(span, file$7, 41, 32, 1530);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[19].questPoint + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$7.name,
    		type: "if",
    		source: "(41:28) {#if item.questPoint >= 0}",
    		ctx
    	});

    	return block;
    }

    // (46:28) {#if item.language}
    function create_if_block_2$7(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[19].language + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "language location");
    			add_location(span, file$7, 46, 32, 1769);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[19].language + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$7.name,
    		type: "if",
    		source: "(46:28) {#if item.language}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Titles as item, key}
    function create_each_block$6(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div;
    	let i0;
    	let t5;
    	let i1;
    	let i1_data_id_value;
    	let t6;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[19].title && create_if_block_6$3(ctx);
    	let if_block1 = /*item*/ ctx[19].price && create_if_block_5$6(ctx);
    	let if_block2 = /*item*/ ctx[19].description && create_if_block_4$6(ctx);
    	let if_block3 = /*item*/ ctx[19].questPoint >= 0 && create_if_block_3$7(ctx);
    	let if_block4 = /*item*/ ctx[19].language && create_if_block_2$7(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			div = element("div");
    			i0 = element("i");
    			t5 = space();
    			i1 = element("i");
    			t6 = space();
    			add_location(p, file$7, 24, 24, 723);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$7, 52, 28, 2044);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[19].id);
    			add_location(i1, file$7, 53, 28, 2130);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$7, 51, 24, 1986);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$7, 23, 20, 673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(p, t2);
    			if (if_block3) if_block3.m(p, null);
    			append_dev(p, t3);
    			if (if_block4) if_block4.m(p, null);
    			append_dev(li, t4);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t5);
    			append_dev(div, i1);
    			append_dev(li, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[11], false, false, false),
    					listen_dev(i1, "click", /*deleteWord*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[19].title) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$3(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[19].price) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$6(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[19].description) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$6(ctx);
    					if_block2.c();
    					if_block2.m(p, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*item*/ ctx[19].questPoint >= 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_3$7(ctx);
    					if_block3.c();
    					if_block3.m(p, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*item*/ ctx[19].language) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_2$7(ctx);
    					if_block4.c();
    					if_block4.m(p, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*Titles*/ 32 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[19].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(23:16) {#each Titles as item, key}",
    		ctx
    	});

    	return block;
    }

    // (85:8) {:else}
    function create_else_block$7(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$7, 85, 12, 3398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateWord*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(85:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (83:8) {#if editorCreated}
    function create_if_block$7(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$7, 83, 12, 3305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createWord*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(83:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div9;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div8;
    	let div7;
    	let div5;
    	let input0;
    	let t7;
    	let input1;
    	let t8;
    	let input2;
    	let t9;
    	let select;
    	let option0;
    	let option1;
    	let t12;
    	let div6;
    	let textarea;
    	let t13;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Titles*/ ctx[5] == 'string' && create_if_block_7$3(ctx);
    	let if_block1 = typeof /*Titles*/ ctx[5] != 'string' && create_if_block_1$7(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[4]) return create_if_block$7;
    		return create_else_block$7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div5 = element("div");
    			input0 = element("input");
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			input2 = element("input");
    			t9 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "PT-BR";
    			option1 = element("option");
    			option1.textContent = "EN";
    			t12 = space();
    			div6 = element("div");
    			textarea = element("textarea");
    			t13 = space();
    			if_block2.c();
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$7, 3, 12, 113);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$7, 2, 8, 76);
    			add_location(p, file$7, 6, 12, 230);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$7, 9, 12, 288);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$7, 5, 8, 166);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$7, 1, 4, 45);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$7, 13, 8, 393);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$7, 12, 4, 350);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$7, 61, 4, 2340);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "name");
    			attr_dev(input0, "placeholder", "Título da quest");
    			add_location(input0, file$7, 66, 16, 2498);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "email");
    			attr_dev(input1, "placeholder", "Preço da quest");
    			add_location(input1, file$7, 67, 16, 2601);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "points");
    			attr_dev(input2, "placeholder", "Pontos da quest");
    			add_location(input2, file$7, 68, 16, 2703);
    			option0.__value = "pt-br";
    			option0.value = option0.__value;
    			attr_dev(option0, "default", "");
    			option0.selected = true;
    			add_location(option0, file$7, 70, 20, 2892);
    			option1.__value = "en";
    			option1.value = option1.__value;
    			add_location(option1, file$7, 71, 20, 2967);
    			attr_dev(select, "name", "language");
    			attr_dev(select, "id", "language");
    			add_location(select, file$7, 69, 16, 2808);
    			attr_dev(div5, "class", "input-control");
    			add_location(div5, file$7, 65, 12, 2453);
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "class", "discord");
    			attr_dev(textarea, "placeholder", "Descrição da quest");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "cols", "33");
    			add_location(textarea, file$7, 75, 16, 3103);
    			attr_dev(div6, "class", "input-control");
    			add_location(div6, file$7, 74, 12, 3058);
    			attr_dev(div7, "class", "four-inputs");
    			add_location(div7, file$7, 64, 8, 2414);
    			attr_dev(div8, "class", "content-creator");
    			add_location(div8, file$7, 62, 4, 2373);
    			attr_dev(div9, "class", "content word-editor quest");
    			add_location(div9, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div9, t3);
    			append_dev(div9, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div9, t5);
    			append_dev(div9, div4);
    			append_dev(div9, t6);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div5, input0);
    			set_input_value(input0, /*devName*/ ctx[0]);
    			append_dev(div5, t7);
    			append_dev(div5, input1);
    			set_input_value(input1, /*devEmail*/ ctx[1]);
    			append_dev(div5, t8);
    			append_dev(div5, input2);
    			set_input_value(input2, /*devPoints*/ ctx[3]);
    			append_dev(div5, t9);
    			append_dev(div5, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(div7, t12);
    			append_dev(div7, div6);
    			append_dev(div6, textarea);
    			set_input_value(textarea, /*devDiscord*/ ctx[2]);
    			append_dev(div8, t13);
    			if_block2.m(div8, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[10], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[12]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[13]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[14]),
    					listen_dev(select, "change", /*getLanguage*/ ctx[6], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Titles*/ ctx[5] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7$3(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Titles*/ ctx[5] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$7(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*devName*/ 1 && input0.value !== /*devName*/ ctx[0]) {
    				set_input_value(input0, /*devName*/ ctx[0]);
    			}

    			if (dirty & /*devEmail*/ 2 && input1.value !== /*devEmail*/ ctx[1]) {
    				set_input_value(input1, /*devEmail*/ ctx[1]);
    			}

    			if (dirty & /*devPoints*/ 8 && input2.value !== /*devPoints*/ ctx[3]) {
    				set_input_value(input2, /*devPoints*/ ctx[3]);
    			}

    			if (dirty & /*devDiscord*/ 4) {
    				set_input_value(textarea, /*devDiscord*/ ctx[2]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div8, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Quests', slots, []);
    	let devName, devEmail, devDiscord, devPoints;
    	let editorCreated = true;
    	let identifier = null;
    	let language = 'pt-br';
    	let Titles = [];

    	onMount(async () => {
    		checkLogged();
    		await feedUpdate();
    	});

    	const feedUpdate = async () => {
    		//startRestLoading();
    		const res = await startARest('/quest', 'GET');

    		if (res != undefined) {
    			$$invalidate(5, Titles = res[0].getQuests);
    			setNewNotification('Quests carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(5, Titles = 'Sem itens');
    		}

    		rollDown();
    	};

    	const getLanguage = e => {
    		language = e.target.value;
    	};

    	const createWord = async () => {
    		let json = {
    			title: devName,
    			price: devEmail,
    			description: devDiscord,
    			points: Number(devPoints),
    			language
    		};

    		await startARest('/quest/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const updateWord = async () => {
    		let json = {
    			name: devName,
    			email: devEmail,
    			discord: devDiscord,
    			points: devPoints
    		};

    		await startARest(`/quest/update/${identifier}`, 'PUT', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			550
    		);
    	};

    	const deleteWord = async e => {
    		await startARest(`/quest/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const startEditor = e => {
    		$$invalidate(4, editorCreated = true);
    	};

    	const handleEditValue = e => {
    		identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		$$invalidate(0, devName = e.target.parentElement.parentElement.children[0].children[0].innerHTML);
    		$$invalidate(1, devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML);
    		$$invalidate(2, devDiscord = e.target.parentElement.parentElement.children[0].children[2].innerHTML);
    		$$invalidate(3, devPoints = e.target.parentElement.parentElement.children[0].children[3].innerHTML);
    		$$invalidate(4, editorCreated = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Quests> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		devName = this.value;
    		$$invalidate(0, devName);
    	}

    	function input1_input_handler() {
    		devEmail = this.value;
    		$$invalidate(1, devEmail);
    	}

    	function input2_input_handler() {
    		devPoints = this.value;
    		$$invalidate(3, devPoints);
    	}

    	function textarea_input_handler() {
    		devDiscord = this.value;
    		$$invalidate(2, devDiscord);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		getCookie,
    		checkLogged,
    		rollDown,
    		devName,
    		devEmail,
    		devDiscord,
    		devPoints,
    		editorCreated,
    		identifier,
    		language,
    		Titles,
    		feedUpdate,
    		getLanguage,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('devName' in $$props) $$invalidate(0, devName = $$props.devName);
    		if ('devEmail' in $$props) $$invalidate(1, devEmail = $$props.devEmail);
    		if ('devDiscord' in $$props) $$invalidate(2, devDiscord = $$props.devDiscord);
    		if ('devPoints' in $$props) $$invalidate(3, devPoints = $$props.devPoints);
    		if ('editorCreated' in $$props) $$invalidate(4, editorCreated = $$props.editorCreated);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    		if ('language' in $$props) language = $$props.language;
    		if ('Titles' in $$props) $$invalidate(5, Titles = $$props.Titles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		devName,
    		devEmail,
    		devDiscord,
    		devPoints,
    		editorCreated,
    		Titles,
    		getLanguage,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea_input_handler
    	];
    }

    class Quests extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quests",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\editors\Questions.svelte generated by Svelte v3.46.2 */
    const file$6 = "src\\editors\\Questions.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Titles == 'string'}
    function create_if_block_5$5(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Titles*/ ctx[3]);
    			add_location(h3, file$6, 16, 16, 481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 8) set_data_dev(t, /*Titles*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$5.name,
    		type: "if",
    		source: "(16:12) {#if typeof Titles == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Titles != 'string'}
    function create_if_block_1$6(ctx) {
    	let each_1_anchor;
    	let each_value = /*Titles*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles, deleteWord, handleEditValue*/ 648) {
    				each_value = /*Titles*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(22:12) {#if typeof Titles != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (26:28) {#if item.question}
    function create_if_block_4$5(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].question + "";
    	let t;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "question");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[17].id);
    			add_location(span, file$6, 26, 32, 807);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 8 && t_value !== (t_value = /*item*/ ctx[17].question + "")) set_data_dev(t, t_value);

    			if (dirty & /*Titles*/ 8 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[17].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$5.name,
    		type: "if",
    		source: "(26:28) {#if item.question}",
    		ctx
    	});

    	return block;
    }

    // (31:28) {#if item.answer}
    function create_if_block_3$6(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].answer + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "answer");
    			add_location(span, file$6, 31, 32, 1058);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 8 && t_value !== (t_value = /*item*/ ctx[17].answer + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$6.name,
    		type: "if",
    		source: "(31:28) {#if item.answer}",
    		ctx
    	});

    	return block;
    }

    // (36:28) {#if item.language}
    function create_if_block_2$6(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].language + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "language");
    			add_location(span, file$6, 36, 32, 1289);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 8 && t_value !== (t_value = /*item*/ ctx[17].language + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(36:28) {#if item.language}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Titles as item, key}
    function create_each_block$5(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let div;
    	let i0;
    	let t3;
    	let i1;
    	let i1_data_id_value;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[17].question && create_if_block_4$5(ctx);
    	let if_block1 = /*item*/ ctx[17].answer && create_if_block_3$6(ctx);
    	let if_block2 = /*item*/ ctx[17].language && create_if_block_2$6(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div = element("div");
    			i0 = element("i");
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			add_location(p, file$6, 24, 24, 721);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$6, 42, 28, 1555);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[17].id);
    			add_location(i1, file$6, 43, 28, 1641);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$6, 41, 24, 1497);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$6, 23, 20, 671);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(li, t2);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t3);
    			append_dev(div, i1);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[9], false, false, false),
    					listen_dev(i1, "click", /*deleteWord*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[17].question) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$5(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[17].answer) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$6(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[17].language) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$6(ctx);
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*Titles*/ 8 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[17].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(23:16) {#each Titles as item, key}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {:else}
    function create_else_block$6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$6, 71, 12, 2642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateWord*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(71:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (69:8) {#if editorCreated}
    function create_if_block$6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$6, 69, 12, 2549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createWord*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(69:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div8;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div7;
    	let div6;
    	let div5;
    	let textarea0;
    	let t7;
    	let textarea1;
    	let t8;
    	let select;
    	let option0;
    	let option1;
    	let t11;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Titles*/ ctx[3] == 'string' && create_if_block_5$5(ctx);
    	let if_block1 = typeof /*Titles*/ ctx[3] != 'string' && create_if_block_1$6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[2]) return create_if_block$6;
    		return create_else_block$6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			textarea0 = element("textarea");
    			t7 = space();
    			textarea1 = element("textarea");
    			t8 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "PT-BR";
    			option1 = element("option");
    			option1.textContent = "EN";
    			t11 = space();
    			if_block2.c();
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$6, 3, 12, 111);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$6, 2, 8, 74);
    			add_location(p, file$6, 6, 12, 228);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$6, 9, 12, 286);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$6, 5, 8, 164);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$6, 1, 4, 43);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$6, 13, 8, 391);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$6, 12, 4, 348);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$6, 51, 4, 1851);
    			attr_dev(textarea0, "type", "text");
    			attr_dev(textarea0, "class", "name");
    			attr_dev(textarea0, "placeholder", "Pergunta");
    			attr_dev(textarea0, "rows", "5");
    			attr_dev(textarea0, "cols", "33");
    			add_location(textarea0, file$6, 56, 16, 2009);
    			attr_dev(textarea1, "type", "text");
    			attr_dev(textarea1, "class", "email");
    			attr_dev(textarea1, "placeholder", "Resposta");
    			attr_dev(textarea1, "rows", "5");
    			attr_dev(textarea1, "cols", "33");
    			add_location(textarea1, file$6, 57, 16, 2127);
    			option0.__value = "pt-br";
    			option0.value = option0.__value;
    			attr_dev(option0, "default", "");
    			option0.selected = true;
    			add_location(option0, file$6, 59, 20, 2330);
    			option1.__value = "en";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 60, 20, 2405);
    			attr_dev(select, "name", "language");
    			attr_dev(select, "id", "language");
    			add_location(select, file$6, 58, 16, 2246);
    			attr_dev(div5, "class", "input-control");
    			add_location(div5, file$6, 55, 12, 1964);
    			attr_dev(div6, "class", "four-inputs");
    			add_location(div6, file$6, 54, 8, 1925);
    			attr_dev(div7, "class", "content-creator");
    			add_location(div7, file$6, 52, 4, 1884);
    			attr_dev(div8, "class", "content word-editor faq");
    			add_location(div8, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div8, t3);
    			append_dev(div8, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div8, t5);
    			append_dev(div8, div4);
    			append_dev(div8, t6);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, textarea0);
    			set_input_value(textarea0, /*devName*/ ctx[0]);
    			append_dev(div5, t7);
    			append_dev(div5, textarea1);
    			set_input_value(textarea1, /*devEmail*/ ctx[1]);
    			append_dev(div5, t8);
    			append_dev(div5, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(div7, t11);
    			if_block2.m(div7, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[8], false, false, false),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[10]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[11]),
    					listen_dev(select, "change", /*getLanguage*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Titles*/ ctx[3] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$5(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Titles*/ ctx[3] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$6(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*devName*/ 1) {
    				set_input_value(textarea0, /*devName*/ ctx[0]);
    			}

    			if (dirty & /*devEmail*/ 2) {
    				set_input_value(textarea1, /*devEmail*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div7, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Questions', slots, []);
    	let devName, devEmail, devDiscord, devPoints;
    	let editorCreated = true;
    	let identifier = null;
    	let language = 'pt-br';
    	let Titles = [];

    	onMount(async () => {
    		checkLogged();
    		await feedUpdate();
    	});

    	const feedUpdate = async () => {
    		//startRestLoading();
    		const res = await startARest('/faq', 'GET');

    		if (res != undefined) {
    			$$invalidate(3, Titles = res[0].getQuestions);
    			setNewNotification('Questions carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(3, Titles = 'Sem itens');
    		}

    		rollDown();
    	};

    	const getLanguage = e => {
    		language = e.target.value;
    	};

    	const createWord = async () => {
    		let json = {
    			question: devName,
    			answer: devEmail,
    			language
    		};

    		await startARest('/faq/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const updateWord = async () => {
    		let json = {
    			question: devName,
    			answer: devEmail,
    			language
    		};

    		await startARest(`/faq/update/${identifier}`, 'PUT', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			550
    		);
    	};

    	const deleteWord = async e => {
    		await startARest(`/faq/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const startEditor = e => {
    		$$invalidate(2, editorCreated = true);
    	};

    	const handleEditValue = e => {
    		identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		$$invalidate(0, devName = e.target.parentElement.parentElement.children[0].children[0].innerHTML);
    		$$invalidate(1, devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML);
    		devDiscord = e.target.parentElement.parentElement.children[0].children[2].innerHTML;
    		$$invalidate(2, editorCreated = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Questions> was created with unknown prop '${key}'`);
    	});

    	function textarea0_input_handler() {
    		devName = this.value;
    		$$invalidate(0, devName);
    	}

    	function textarea1_input_handler() {
    		devEmail = this.value;
    		$$invalidate(1, devEmail);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		getCookie,
    		checkLogged,
    		rollDown,
    		devName,
    		devEmail,
    		devDiscord,
    		devPoints,
    		editorCreated,
    		identifier,
    		language,
    		Titles,
    		feedUpdate,
    		getLanguage,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('devName' in $$props) $$invalidate(0, devName = $$props.devName);
    		if ('devEmail' in $$props) $$invalidate(1, devEmail = $$props.devEmail);
    		if ('devDiscord' in $$props) devDiscord = $$props.devDiscord;
    		if ('devPoints' in $$props) devPoints = $$props.devPoints;
    		if ('editorCreated' in $$props) $$invalidate(2, editorCreated = $$props.editorCreated);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    		if ('language' in $$props) language = $$props.language;
    		if ('Titles' in $$props) $$invalidate(3, Titles = $$props.Titles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		devName,
    		devEmail,
    		editorCreated,
    		Titles,
    		getLanguage,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		textarea0_input_handler,
    		textarea1_input_handler
    	];
    }

    class Questions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Questions",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\editors\QuestionsClients.svelte generated by Svelte v3.46.2 */
    const file$5 = "src\\editors\\QuestionsClients.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Titles == 'string'}
    function create_if_block_5$4(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Titles*/ ctx[3]);
    			add_location(h3, file$5, 16, 16, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 8) set_data_dev(t, /*Titles*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$4.name,
    		type: "if",
    		source: "(16:12) {#if typeof Titles == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Titles != 'string'}
    function create_if_block_1$5(ctx) {
    	let each_1_anchor;
    	let each_value = /*Titles*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles, deleteWord, handleEditValue*/ 648) {
    				each_value = /*Titles*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(22:12) {#if typeof Titles != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (26:28) {#if item.question}
    function create_if_block_4$4(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].question + "";
    	let t;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "question");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[17].id);
    			add_location(span, file$5, 26, 32, 814);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 8 && t_value !== (t_value = /*item*/ ctx[17].question + "")) set_data_dev(t, t_value);

    			if (dirty & /*Titles*/ 8 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[17].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$4.name,
    		type: "if",
    		source: "(26:28) {#if item.question}",
    		ctx
    	});

    	return block;
    }

    // (31:28) {#if item.answer}
    function create_if_block_3$5(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].answer + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "answer");
    			add_location(span, file$5, 31, 32, 1065);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 8 && t_value !== (t_value = /*item*/ ctx[17].answer + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$5.name,
    		type: "if",
    		source: "(31:28) {#if item.answer}",
    		ctx
    	});

    	return block;
    }

    // (36:28) {#if item.language}
    function create_if_block_2$5(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[17].language + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "language");
    			add_location(span, file$5, 36, 32, 1296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 8 && t_value !== (t_value = /*item*/ ctx[17].language + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(36:28) {#if item.language}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Titles as item, key}
    function create_each_block$4(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let div;
    	let i0;
    	let t3;
    	let i1;
    	let i1_data_id_value;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[17].question && create_if_block_4$4(ctx);
    	let if_block1 = /*item*/ ctx[17].answer && create_if_block_3$5(ctx);
    	let if_block2 = /*item*/ ctx[17].language && create_if_block_2$5(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div = element("div");
    			i0 = element("i");
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			add_location(p, file$5, 24, 24, 728);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$5, 42, 28, 1562);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[17].id);
    			add_location(i1, file$5, 43, 28, 1648);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$5, 41, 24, 1504);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$5, 23, 20, 678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(li, t2);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t3);
    			append_dev(div, i1);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[9], false, false, false),
    					listen_dev(i1, "click", /*deleteWord*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[17].question) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$4(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[17].answer) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$5(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[17].language) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$5(ctx);
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*Titles*/ 8 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[17].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(23:16) {#each Titles as item, key}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {:else}
    function create_else_block$5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$5, 71, 12, 2649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateWord*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(71:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (69:8) {#if editorCreated}
    function create_if_block$5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$5, 69, 12, 2556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createWord*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(69:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div8;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div7;
    	let div6;
    	let div5;
    	let textarea0;
    	let t7;
    	let textarea1;
    	let t8;
    	let select;
    	let option0;
    	let option1;
    	let t11;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Titles*/ ctx[3] == 'string' && create_if_block_5$4(ctx);
    	let if_block1 = typeof /*Titles*/ ctx[3] != 'string' && create_if_block_1$5(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[2]) return create_if_block$5;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			textarea0 = element("textarea");
    			t7 = space();
    			textarea1 = element("textarea");
    			t8 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "PT-BR";
    			option1 = element("option");
    			option1.textContent = "EN";
    			t11 = space();
    			if_block2.c();
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$5, 3, 12, 118);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$5, 2, 8, 81);
    			add_location(p, file$5, 6, 12, 235);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$5, 9, 12, 293);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$5, 5, 8, 171);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$5, 1, 4, 50);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$5, 13, 8, 398);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$5, 12, 4, 355);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$5, 51, 4, 1858);
    			attr_dev(textarea0, "type", "text");
    			attr_dev(textarea0, "class", "name");
    			attr_dev(textarea0, "placeholder", "Pergunta");
    			attr_dev(textarea0, "rows", "5");
    			attr_dev(textarea0, "cols", "33");
    			add_location(textarea0, file$5, 56, 16, 2016);
    			attr_dev(textarea1, "type", "text");
    			attr_dev(textarea1, "class", "email");
    			attr_dev(textarea1, "placeholder", "Resposta");
    			attr_dev(textarea1, "rows", "5");
    			attr_dev(textarea1, "cols", "33");
    			add_location(textarea1, file$5, 57, 16, 2134);
    			option0.__value = "pt-br";
    			option0.value = option0.__value;
    			attr_dev(option0, "default", "");
    			option0.selected = true;
    			add_location(option0, file$5, 59, 20, 2337);
    			option1.__value = "en";
    			option1.value = option1.__value;
    			add_location(option1, file$5, 60, 20, 2412);
    			attr_dev(select, "name", "language");
    			attr_dev(select, "id", "language");
    			add_location(select, file$5, 58, 16, 2253);
    			attr_dev(div5, "class", "input-control");
    			add_location(div5, file$5, 55, 12, 1971);
    			attr_dev(div6, "class", "four-inputs");
    			add_location(div6, file$5, 54, 8, 1932);
    			attr_dev(div7, "class", "content-creator");
    			add_location(div7, file$5, 52, 4, 1891);
    			attr_dev(div8, "class", "content word-editor faq-client");
    			add_location(div8, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div8, t3);
    			append_dev(div8, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div8, t5);
    			append_dev(div8, div4);
    			append_dev(div8, t6);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, textarea0);
    			set_input_value(textarea0, /*devName*/ ctx[0]);
    			append_dev(div5, t7);
    			append_dev(div5, textarea1);
    			set_input_value(textarea1, /*devEmail*/ ctx[1]);
    			append_dev(div5, t8);
    			append_dev(div5, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(div7, t11);
    			if_block2.m(div7, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[8], false, false, false),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[10]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[11]),
    					listen_dev(select, "change", /*getLanguage*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Titles*/ ctx[3] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$4(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Titles*/ ctx[3] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$5(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*devName*/ 1) {
    				set_input_value(textarea0, /*devName*/ ctx[0]);
    			}

    			if (dirty & /*devEmail*/ 2) {
    				set_input_value(textarea1, /*devEmail*/ ctx[1]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div7, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('QuestionsClients', slots, []);
    	let devName, devEmail, devDiscord, devPoints;
    	let editorCreated = true;
    	let identifier = null;
    	let language = 'pt-br';
    	let Titles = [];

    	onMount(async () => {
    		checkLogged();
    		await feedUpdate();
    	});

    	const feedUpdate = async () => {
    		//startRestLoading();
    		const res = await startARest('/clt', 'GET');

    		if (res != undefined) {
    			$$invalidate(3, Titles = res[0].getFaqClt);
    			setNewNotification('Questions carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(3, Titles = 'Sem itens');
    		}

    		rollDown();
    	};

    	const getLanguage = e => {
    		language = e.target.value;
    	};

    	const createWord = async () => {
    		let json = {
    			question: devName,
    			answer: devEmail,
    			language
    		};

    		await startARest('/clt/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const updateWord = async () => {
    		let json = {
    			question: devName,
    			answer: devEmail,
    			language
    		};

    		await startARest(`/clt/update/${identifier}`, 'PUT', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			550
    		);
    	};

    	const deleteWord = async e => {
    		await startARest(`/clt/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const startEditor = e => {
    		$$invalidate(2, editorCreated = true);
    	};

    	const handleEditValue = e => {
    		identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		$$invalidate(0, devName = e.target.parentElement.parentElement.children[0].children[0].innerHTML);
    		$$invalidate(1, devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML);
    		devDiscord = e.target.parentElement.parentElement.children[0].children[2].innerHTML;
    		$$invalidate(2, editorCreated = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<QuestionsClients> was created with unknown prop '${key}'`);
    	});

    	function textarea0_input_handler() {
    		devName = this.value;
    		$$invalidate(0, devName);
    	}

    	function textarea1_input_handler() {
    		devEmail = this.value;
    		$$invalidate(1, devEmail);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		getCookie,
    		checkLogged,
    		rollDown,
    		devName,
    		devEmail,
    		devDiscord,
    		devPoints,
    		editorCreated,
    		identifier,
    		language,
    		Titles,
    		feedUpdate,
    		getLanguage,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('devName' in $$props) $$invalidate(0, devName = $$props.devName);
    		if ('devEmail' in $$props) $$invalidate(1, devEmail = $$props.devEmail);
    		if ('devDiscord' in $$props) devDiscord = $$props.devDiscord;
    		if ('devPoints' in $$props) devPoints = $$props.devPoints;
    		if ('editorCreated' in $$props) $$invalidate(2, editorCreated = $$props.editorCreated);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    		if ('language' in $$props) language = $$props.language;
    		if ('Titles' in $$props) $$invalidate(3, Titles = $$props.Titles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		devName,
    		devEmail,
    		editorCreated,
    		Titles,
    		getLanguage,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		textarea0_input_handler,
    		textarea1_input_handler
    	];
    }

    class QuestionsClients extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuestionsClients",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\editors\Collab.svelte generated by Svelte v3.46.2 */
    const file$4 = "src\\editors\\Collab.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Titles == 'string'}
    function create_if_block_8$1(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Titles*/ ctx[4]);
    			add_location(h3, file$4, 16, 16, 484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16) set_data_dev(t, /*Titles*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(16:12) {#if typeof Titles == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Titles != 'string'}
    function create_if_block_4$3(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*Titles*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles, deleteWord, handleEditValue*/ 1296) {
    				each_value_1 = /*Titles*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$3.name,
    		type: "if",
    		source: "(22:12) {#if typeof Titles != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (26:28) {#if item.devPic}
    function create_if_block_7$2(ctx) {
    	let span;
    	let div;
    	let img;
    	let img_src_value;
    	let img_data_media_value;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/" + /*item*/ ctx[20].devPic)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "data-media", img_data_media_value = /*item*/ ctx[20].devPic);
    			attr_dev(img, "alt", "");
    			add_location(img, file$4, 28, 40, 952);
    			attr_dev(div, "class", "mini-player");
    			add_location(div, file$4, 27, 36, 885);
    			attr_dev(span, "class", "devPic");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[20].id);
    			add_location(span, file$4, 26, 32, 808);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, div);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && !src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/" + /*item*/ ctx[20].devPic)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*Titles*/ 16 && img_data_media_value !== (img_data_media_value = /*item*/ ctx[20].devPic)) {
    				attr_dev(img, "data-media", img_data_media_value);
    			}

    			if (dirty & /*Titles*/ 16 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[20].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(26:28) {#if item.devPic}",
    		ctx
    	});

    	return block;
    }

    // (33:28) {#if item.devName}
    function create_if_block_6$2(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[20].devName + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "devName");
    			add_location(span, file$4, 33, 32, 1266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && t_value !== (t_value = /*item*/ ctx[20].devName + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(33:28) {#if item.devName}",
    		ctx
    	});

    	return block;
    }

    // (38:28) {#if item.devLink}
    function create_if_block_5$3(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[20].devLink + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "devLink");
    			add_location(span, file$4, 38, 32, 1498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && t_value !== (t_value = /*item*/ ctx[20].devLink + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$3.name,
    		type: "if",
    		source: "(38:28) {#if item.devLink}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Titles as item, key}
    function create_each_block_1$1(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let div;
    	let i0;
    	let t3;
    	let i1;
    	let i1_data_id_value;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[20].devPic && create_if_block_7$2(ctx);
    	let if_block1 = /*item*/ ctx[20].devName && create_if_block_6$2(ctx);
    	let if_block2 = /*item*/ ctx[20].devLink && create_if_block_5$3(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div = element("div");
    			i0 = element("i");
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			add_location(p, file$4, 24, 24, 724);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$4, 44, 28, 1762);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[20].id);
    			add_location(i1, file$4, 45, 28, 1848);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$4, 43, 24, 1704);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$4, 23, 20, 674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(li, t2);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t3);
    			append_dev(div, i1);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[10], false, false, false),
    					listen_dev(i1, "click", /*deleteWord*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[20].devPic) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7$2(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[20].devName) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_6$2(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[20].devLink) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_5$3(ctx);
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*Titles*/ 16 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[20].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(23:16) {#each Titles as item, key}",
    		ctx
    	});

    	return block;
    }

    // (64:16) {:else}
    function create_else_block_1$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Adicionar foto";
    			attr_dev(button, "class", "btn first image-list");
    			add_location(button, file$4, 64, 20, 2507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*openModal*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(64:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:16) {#if devRender != undefined}
    function create_if_block_3$4(ctx) {
    	let div;
    	let i;
    	let t;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t = space();
    			img = element("img");
    			attr_dev(i, "class", "fas fa-times");
    			add_location(i, file$4, 60, 24, 2319);
    			if (!src_url_equal(img.src, img_src_value = /*devRender*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$4, 61, 24, 2404);
    			attr_dev(div, "class", "image-control");
    			add_location(div, file$4, 59, 20, 2266);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*deletFeedDevMedia*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*devRender*/ 1 && !src_url_equal(img.src, img_src_value = /*devRender*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(59:16) {#if devRender != undefined}",
    		ctx
    	});

    	return block;
    }

    // (77:20) {#if Images.length <= 0}
    function create_if_block_2$4(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Não há imagens cadastradas";
    			add_location(h3, file$4, 77, 24, 3135);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(77:20) {#if Images.length <= 0}",
    		ctx
    	});

    	return block;
    }

    // (82:20) {#if Images.length >= 1}
    function create_if_block_1$4(ctx) {
    	let each_1_anchor;
    	let each_value = /*Images*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Images, feedDevMedia*/ 4128) {
    				each_value = /*Images*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(82:20) {#if Images.length >= 1}",
    		ctx
    	});

    	return block;
    }

    // (83:24) {#each Images as item, i}
    function create_each_block$3(ctx) {
    	let li;
    	let p;
    	let span0;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let span1;
    	let t1_value = /*item*/ ctx[20].slice(47) + "";
    	let t1;
    	let t2;
    	let div1;
    	let i_1;
    	let i_1_data_id_value;
    	let t3;
    	let li_data_media_value;
    	let li_data_item_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			span0 = element("span");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			i_1 = element("i");
    			t3 = space();
    			if (!src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/" + /*item*/ ctx[20])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[20].slice(47));
    			add_location(img, file$4, 87, 44, 3637);
    			attr_dev(div0, "class", "mini-player");
    			add_location(div0, file$4, 86, 40, 3566);
    			add_location(span0, file$4, 85, 36, 3518);
    			add_location(span1, file$4, 90, 36, 3860);
    			add_location(p, file$4, 84, 32, 3477);
    			attr_dev(i_1, "class", "fas fa-file");
    			attr_dev(i_1, "data-id", i_1_data_id_value = /*item*/ ctx[20].id);
    			add_location(i_1, file$4, 95, 36, 4107);
    			attr_dev(div1, "class", "action-editors");
    			add_location(div1, file$4, 94, 32, 4041);
    			attr_dev(li, "class", "item-editor");
    			attr_dev(li, "data-media", li_data_media_value = /*item*/ ctx[20]);
    			attr_dev(li, "data-item", li_data_item_value = /*item*/ ctx[20]);
    			add_location(li, file$4, 83, 28, 3380);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, span0);
    			append_dev(span0, div0);
    			append_dev(div0, img);
    			append_dev(p, t0);
    			append_dev(p, span1);
    			append_dev(span1, t1);
    			append_dev(li, t2);
    			append_dev(li, div1);
    			append_dev(div1, i_1);
    			append_dev(li, t3);

    			if (!mounted) {
    				dispose = listen_dev(i_1, "click", /*feedDevMedia*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Images*/ 32 && !src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/" + /*item*/ ctx[20])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*Images*/ 32 && img_alt_value !== (img_alt_value = /*item*/ ctx[20].slice(47))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*Images*/ 32 && t1_value !== (t1_value = /*item*/ ctx[20].slice(47) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*Images*/ 32 && i_1_data_id_value !== (i_1_data_id_value = /*item*/ ctx[20].id)) {
    				attr_dev(i_1, "data-id", i_1_data_id_value);
    			}

    			if (dirty & /*Images*/ 32 && li_data_media_value !== (li_data_media_value = /*item*/ ctx[20])) {
    				attr_dev(li, "data-media", li_data_media_value);
    			}

    			if (dirty & /*Images*/ 32 && li_data_item_value !== (li_data_item_value = /*item*/ ctx[20])) {
    				attr_dev(li, "data-item", li_data_item_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(83:24) {#each Images as item, i}",
    		ctx
    	});

    	return block;
    }

    // (111:8) {:else}
    function create_else_block$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$4, 111, 12, 4520);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateWord*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(111:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (109:8) {#if editorCreated}
    function create_if_block$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$4, 109, 12, 4427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createWord*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(109:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div10;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul0;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div9;
    	let div6;
    	let div5;
    	let t7;
    	let input0;
    	let t8;
    	let input1;
    	let t9;
    	let div8;
    	let i2;
    	let t10;
    	let div7;
    	let ul1;
    	let t11;
    	let t12;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Titles*/ ctx[4] == 'string' && create_if_block_8$1(ctx);
    	let if_block1 = typeof /*Titles*/ ctx[4] != 'string' && create_if_block_4$3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*devRender*/ ctx[0] != undefined) return create_if_block_3$4;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = /*Images*/ ctx[5].length <= 0 && create_if_block_2$4(ctx);
    	let if_block4 = /*Images*/ ctx[5].length >= 1 && create_if_block_1$4(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*editorCreated*/ ctx[3]) return create_if_block$4;
    		return create_else_block$4;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block5 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul0 = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div9 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			if_block2.c();
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div8 = element("div");
    			i2 = element("i");
    			t10 = space();
    			div7 = element("div");
    			ul1 = element("ul");
    			if (if_block3) if_block3.c();
    			t11 = space();
    			if (if_block4) if_block4.c();
    			t12 = space();
    			if_block5.c();
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$4, 3, 12, 114);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$4, 2, 8, 77);
    			add_location(p, file$4, 6, 12, 231);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$4, 9, 12, 289);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$4, 5, 8, 167);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$4, 1, 4, 46);
    			attr_dev(ul0, "class", "list-editors");
    			add_location(ul0, file$4, 13, 8, 394);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$4, 12, 4, 351);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$4, 53, 4, 2058);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "email");
    			attr_dev(input0, "placeholder", "Nome do dev");
    			add_location(input0, file$4, 66, 16, 2633);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "points");
    			attr_dev(input1, "placeholder", "Link de portifólio");
    			add_location(input1, file$4, 67, 16, 2732);
    			attr_dev(div5, "class", "input-control");
    			add_location(div5, file$4, 57, 12, 2171);
    			attr_dev(div6, "class", "four-inputs");
    			add_location(div6, file$4, 56, 8, 2132);
    			attr_dev(i2, "class", "fas fa-times");
    			add_location(i2, file$4, 73, 12, 2924);
    			attr_dev(ul1, "class", "list-editors");
    			add_location(ul1, file$4, 75, 16, 3038);
    			attr_dev(div7, "class", "modal image-list");
    			add_location(div7, file$4, 74, 12, 2990);
    			attr_dev(div8, "class", "modal-controller unview");
    			add_location(div8, file$4, 72, 8, 2873);
    			attr_dev(div9, "class", "content-creator");
    			add_location(div9, file$4, 54, 4, 2091);
    			attr_dev(div10, "class", "content word-editor collab");
    			add_location(div10, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div10, t3);
    			append_dev(div10, div3);
    			append_dev(div3, ul0);
    			if (if_block0) if_block0.m(ul0, null);
    			append_dev(ul0, t4);
    			if (if_block1) if_block1.m(ul0, null);
    			append_dev(div10, t5);
    			append_dev(div10, div4);
    			append_dev(div10, t6);
    			append_dev(div10, div9);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			if_block2.m(div5, null);
    			append_dev(div5, t7);
    			append_dev(div5, input0);
    			set_input_value(input0, /*devEmail*/ ctx[1]);
    			append_dev(div5, t8);
    			append_dev(div5, input1);
    			set_input_value(input1, /*devDiscord*/ ctx[2]);
    			append_dev(div9, t9);
    			append_dev(div9, div8);
    			append_dev(div8, i2);
    			append_dev(div8, t10);
    			append_dev(div8, div7);
    			append_dev(div7, ul1);
    			if (if_block3) if_block3.m(ul1, null);
    			append_dev(ul1, t11);
    			if (if_block4) if_block4.m(ul1, null);
    			append_dev(div9, t12);
    			if_block5.m(div9, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[9], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[15]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    					listen_dev(i2, "click", /*closeModal*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Titles*/ ctx[4] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8$1(ctx);
    					if_block0.c();
    					if_block0.m(ul0, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Titles*/ ctx[4] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4$3(ctx);
    					if_block1.c();
    					if_block1.m(ul0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div5, t7);
    				}
    			}

    			if (dirty & /*devEmail*/ 2 && input0.value !== /*devEmail*/ ctx[1]) {
    				set_input_value(input0, /*devEmail*/ ctx[1]);
    			}

    			if (dirty & /*devDiscord*/ 4 && input1.value !== /*devDiscord*/ ctx[2]) {
    				set_input_value(input1, /*devDiscord*/ ctx[2]);
    			}

    			if (/*Images*/ ctx[5].length <= 0) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_2$4(ctx);
    					if_block3.c();
    					if_block3.m(ul1, t11);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*Images*/ ctx[5].length >= 1) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1$4(ctx);
    					if_block4.c();
    					if_block4.m(ul1, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block5) {
    				if_block5.p(ctx, dirty);
    			} else {
    				if_block5.d(1);
    				if_block5 = current_block_type_1(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div9, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if_block5.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Collab', slots, []);
    	let devName, devRender, devEmail, devDiscord;
    	let editorCreated = true;
    	let identifier = null;
    	let Titles = [];
    	let Images = [];

    	onMount(async () => {
    		checkLogged();
    		feedUpdate();
    	});

    	const feedUpdate = async () => {
    		//startRestLoading();
    		const res = await startARest('/collab', 'GET');

    		if (res != undefined) {
    			$$invalidate(4, Titles = res[0].getCollabs);
    			setNewNotification('Colaboradores carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(4, Titles = 'Sem itens');
    		}

    		const imgs = await startARest('/media/list', 'GET', null);

    		if (imgs != undefined) {
    			let treatImages = imgs[0].listStream;
    			let treatedImages = [];

    			treatImages.filter(media => {
    				if (media.replace('media/', '').length != 0) {
    					treatedImages.push(media);
    				}
    			});

    			$$invalidate(5, Images = treatedImages);
    			setNewNotification('Imagens carregadas com sucesso!', 'success');
    		} else {
    			$$invalidate(5, Images = 'Imagens não cadastradas');
    		}

    		rollDown();
    	};

    	const createWord = async () => {
    		let json = {
    			picture: devName,
    			name: devEmail,
    			link: devDiscord == undefined
    			? $$invalidate(2, devDiscord = '')
    			: devDiscord
    		};

    		await startARest('/collab/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const updateWord = async () => {
    		let json = {
    			picture: devName,
    			name: devEmail,
    			link: devDiscord == undefined
    			? $$invalidate(2, devDiscord = '')
    			: devDiscord
    		};

    		await startARest(`/collab/update/${identifier}`, 'PUT', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			550
    		);
    	};

    	const deleteWord = async e => {
    		await startARest(`/collab/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const startEditor = e => {
    		(devName = '', $$invalidate(0, devRender = undefined), $$invalidate(1, devEmail = ''), $$invalidate(2, devDiscord = ''));
    		$$invalidate(3, editorCreated = true);
    	};

    	const handleEditValue = e => {
    		identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		devName = e.target.parentElement.parentElement.children[0].children[0].children[0].children[0].dataset.media;
    		$$invalidate(0, devRender = e.target.parentElement.parentElement.children[0].children[0].children[0].children[0].src);
    		$$invalidate(1, devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML);

    		$$invalidate(2, devDiscord = e.target.parentElement.parentElement.children[0].children[2] == undefined
    		? ''
    		: e.target.parentElement.parentElement.children[0].children[2].innerHTML);

    		$$invalidate(3, editorCreated = false);
    	};

    	const deletFeedDevMedia = () => {
    		$$invalidate(0, devRender = undefined);
    		devName = undefined;
    	};

    	const feedDevMedia = e => {
    		devName = e.target.parentElement.parentElement.dataset.media;
    		$$invalidate(0, devRender = `https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/${devName}`);
    		closeModal();
    	};

    	const openModal = () => {
    		let modalController = document.querySelector('.modal-controller');
    		modalController.classList.remove('unview');
    	};

    	const closeModal = () => {
    		let modalController = document.querySelector('.modal-controller');
    		modalController.classList.add('unview');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Collab> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		devEmail = this.value;
    		$$invalidate(1, devEmail);
    	}

    	function input1_input_handler() {
    		devDiscord = this.value;
    		$$invalidate(2, devDiscord);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		getCookie,
    		checkLogged,
    		rollDown,
    		devName,
    		devRender,
    		devEmail,
    		devDiscord,
    		editorCreated,
    		identifier,
    		Titles,
    		Images,
    		feedUpdate,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		deletFeedDevMedia,
    		feedDevMedia,
    		openModal,
    		closeModal
    	});

    	$$self.$inject_state = $$props => {
    		if ('devName' in $$props) devName = $$props.devName;
    		if ('devRender' in $$props) $$invalidate(0, devRender = $$props.devRender);
    		if ('devEmail' in $$props) $$invalidate(1, devEmail = $$props.devEmail);
    		if ('devDiscord' in $$props) $$invalidate(2, devDiscord = $$props.devDiscord);
    		if ('editorCreated' in $$props) $$invalidate(3, editorCreated = $$props.editorCreated);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    		if ('Titles' in $$props) $$invalidate(4, Titles = $$props.Titles);
    		if ('Images' in $$props) $$invalidate(5, Images = $$props.Images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		devRender,
    		devEmail,
    		devDiscord,
    		editorCreated,
    		Titles,
    		Images,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		deletFeedDevMedia,
    		feedDevMedia,
    		openModal,
    		closeModal,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Collab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collab",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\editors\Work.svelte generated by Svelte v3.46.2 */
    const file$3 = "src\\editors\\Work.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[23] = list;
    	child_ctx[24] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Titles == 'string'}
    function create_if_block_7$1(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Titles*/ ctx[5]);
    			add_location(h3, file$3, 16, 16, 477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32) set_data_dev(t, /*Titles*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(16:12) {#if typeof Titles == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Titles != 'string'}
    function create_if_block_1$3(ctx) {
    	let each_1_anchor;
    	let each_value = /*Titles*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles, deleteWord, handleEditValue*/ 2592) {
    				each_value = /*Titles*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(22:12) {#if typeof Titles != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (26:28) {#if item.title}
    function create_if_block_6$1(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[22].title + "";
    	let t;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "title");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[22].id);
    			add_location(span, file$3, 26, 32, 800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[22].title + "")) set_data_dev(t, t_value);

    			if (dirty & /*Titles*/ 32 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[22].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(26:28) {#if item.title}",
    		ctx
    	});

    	return block;
    }

    // (31:28) {#if item.description}
    function create_if_block_5$2(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[22].description + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "description");
    			add_location(span, file$3, 31, 32, 1050);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[22].description + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(31:28) {#if item.description}",
    		ctx
    	});

    	return block;
    }

    // (36:28) {#if item.location}
    function create_if_block_4$2(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[22].location + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "location");
    			add_location(span, file$3, 36, 32, 1291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[22].location + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(36:28) {#if item.location}",
    		ctx
    	});

    	return block;
    }

    // (41:28) {#if item.language}
    function create_if_block_3$3(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[22].language + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "language");
    			add_location(span, file$3, 41, 32, 1526);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[22].language + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(41:28) {#if item.language}",
    		ctx
    	});

    	return block;
    }

    // (46:28) {#if item.icon}
    function create_if_block_2$3(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	function span_input_handler() {
    		/*span_input_handler*/ ctx[12].call(span, /*each_value*/ ctx[23], /*key*/ ctx[24]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "icon-list");
    			attr_dev(span, "contenteditable", "true");
    			if (/*item*/ ctx[22].icon === void 0) add_render_callback(span_input_handler);
    			add_location(span, file$3, 46, 32, 1757);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (/*item*/ ctx[22].icon !== void 0) {
    				span.innerHTML = /*item*/ ctx[22].icon;
    			}

    			if (!mounted) {
    				dispose = listen_dev(span, "input", span_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*Titles*/ 32 && /*item*/ ctx[22].icon !== span.innerHTML) {
    				span.innerHTML = /*item*/ ctx[22].icon;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(46:28) {#if item.icon}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Titles as item, key}
    function create_each_block$2(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div;
    	let i0;
    	let t5;
    	let i1;
    	let i1_data_id_value;
    	let t6;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[22].title && create_if_block_6$1(ctx);
    	let if_block1 = /*item*/ ctx[22].description && create_if_block_5$2(ctx);
    	let if_block2 = /*item*/ ctx[22].location && create_if_block_4$2(ctx);
    	let if_block3 = /*item*/ ctx[22].language && create_if_block_3$3(ctx);
    	let if_block4 = /*item*/ ctx[22].icon && create_if_block_2$3(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			div = element("div");
    			i0 = element("i");
    			t5 = space();
    			i1 = element("i");
    			t6 = space();
    			add_location(p, file$3, 24, 24, 717);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$3, 50, 28, 1987);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[22].id);
    			add_location(i1, file$3, 51, 28, 2073);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$3, 49, 24, 1929);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$3, 23, 20, 667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(p, t2);
    			if (if_block3) if_block3.m(p, null);
    			append_dev(p, t3);
    			if (if_block4) if_block4.m(p, null);
    			append_dev(li, t4);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t5);
    			append_dev(div, i1);
    			append_dev(li, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[11], false, false, false),
    					listen_dev(i1, "click", /*deleteWord*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[22].title) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$1(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[22].description) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$2(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[22].location) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$2(ctx);
    					if_block2.c();
    					if_block2.m(p, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*item*/ ctx[22].language) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_3$3(ctx);
    					if_block3.c();
    					if_block3.m(p, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*item*/ ctx[22].icon) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_2$3(ctx);
    					if_block4.c();
    					if_block4.m(p, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (dirty & /*Titles*/ 32 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[22].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(23:16) {#each Titles as item, key}",
    		ctx
    	});

    	return block;
    }

    // (86:8) {:else}
    function create_else_block$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$3, 86, 12, 3414);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateWord*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(86:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:8) {#if editorCreated}
    function create_if_block$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$3, 84, 12, 3321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createWord*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(84:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div11;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div10;
    	let div8;
    	let div5;
    	let input0;
    	let t7;
    	let div6;
    	let input1;
    	let t8;
    	let div7;
    	let select;
    	let option0;
    	let option1;
    	let t11;
    	let textarea0;
    	let t12;
    	let div9;
    	let span;
    	let t13;
    	let textarea1;
    	let t14;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Titles*/ ctx[5] == 'string' && create_if_block_7$1(ctx);
    	let if_block1 = typeof /*Titles*/ ctx[5] != 'string' && create_if_block_1$3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[2]) return create_if_block$3;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div10 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			input0 = element("input");
    			t7 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t8 = space();
    			div7 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "PT-BR";
    			option1 = element("option");
    			option1.textContent = "EN";
    			t11 = space();
    			textarea0 = element("textarea");
    			t12 = space();
    			div9 = element("div");
    			span = element("span");
    			t13 = space();
    			textarea1 = element("textarea");
    			t14 = space();
    			if_block2.c();
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$3, 3, 12, 107);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$3, 2, 8, 70);
    			add_location(p, file$3, 6, 12, 224);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$3, 9, 12, 282);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$3, 5, 8, 160);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$3, 1, 4, 39);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$3, 13, 8, 387);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$3, 12, 4, 344);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$3, 59, 4, 2283);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "title");
    			add_location(input0, file$3, 64, 16, 2442);
    			attr_dev(div5, "class", "input-control");
    			add_location(div5, file$3, 63, 12, 2397);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "location");
    			add_location(input1, file$3, 67, 16, 2582);
    			attr_dev(div6, "class", "input-control");
    			add_location(div6, file$3, 66, 12, 2537);
    			option0.__value = "pt-br";
    			option0.value = option0.__value;
    			attr_dev(option0, "default", "");
    			option0.selected = true;
    			add_location(option0, file$3, 71, 20, 2803);
    			option1.__value = "en";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 72, 20, 2878);
    			attr_dev(select, "name", "language");
    			attr_dev(select, "id", "language");
    			add_location(select, file$3, 70, 16, 2719);
    			attr_dev(div7, "class", "input-control");
    			add_location(div7, file$3, 69, 12, 2674);
    			attr_dev(div8, "class", "three-inputs");
    			add_location(div8, file$3, 62, 8, 2357);
    			attr_dev(textarea0, "id", "");
    			attr_dev(textarea0, "cols", "30");
    			attr_dev(textarea0, "rows", "10");
    			add_location(textarea0, file$3, 77, 8, 2983);
    			attr_dev(span, "contenteditable", "true");
    			if (/*exampleIcon*/ ctx[4] === void 0) add_render_callback(() => /*span_input_handler_1*/ ctx[16].call(span));
    			add_location(span, file$3, 79, 12, 3109);
    			attr_dev(textarea1, "id", "");
    			attr_dev(textarea1, "cols", "30");
    			attr_dev(textarea1, "rows", "10");
    			add_location(textarea1, file$3, 80, 12, 3188);
    			attr_dev(div9, "class", "icon-controller");
    			add_location(div9, file$3, 78, 8, 3066);
    			attr_dev(div10, "class", "content-creator");
    			add_location(div10, file$3, 60, 4, 2316);
    			attr_dev(div11, "class", "content word-editor");
    			add_location(div11, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div11, t3);
    			append_dev(div11, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div11, t5);
    			append_dev(div11, div4);
    			append_dev(div11, t6);
    			append_dev(div11, div10);
    			append_dev(div10, div8);
    			append_dev(div8, div5);
    			append_dev(div5, input0);
    			set_input_value(input0, /*exampleTitle*/ ctx[0]);
    			append_dev(div8, t7);
    			append_dev(div8, div6);
    			append_dev(div6, input1);
    			set_input_value(input1, /*location*/ ctx[3]);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(div10, t11);
    			append_dev(div10, textarea0);
    			set_input_value(textarea0, /*exampleLorem*/ ctx[1]);
    			append_dev(div10, t12);
    			append_dev(div10, div9);
    			append_dev(div9, span);

    			if (/*exampleIcon*/ ctx[4] !== void 0) {
    				span.innerHTML = /*exampleIcon*/ ctx[4];
    			}

    			append_dev(div9, t13);
    			append_dev(div9, textarea1);
    			set_input_value(textarea1, /*exampleIcon*/ ctx[4]);
    			append_dev(div10, t14);
    			if_block2.m(div10, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[10], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
    					listen_dev(select, "change", /*getLanguage*/ ctx[6], false, false, false),
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[15]),
    					listen_dev(span, "input", /*span_input_handler_1*/ ctx[16]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Titles*/ ctx[5] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7$1(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Titles*/ ctx[5] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*exampleTitle*/ 1 && input0.value !== /*exampleTitle*/ ctx[0]) {
    				set_input_value(input0, /*exampleTitle*/ ctx[0]);
    			}

    			if (dirty & /*location*/ 8 && input1.value !== /*location*/ ctx[3]) {
    				set_input_value(input1, /*location*/ ctx[3]);
    			}

    			if (dirty & /*exampleLorem*/ 2) {
    				set_input_value(textarea0, /*exampleLorem*/ ctx[1]);
    			}

    			if (dirty & /*exampleIcon*/ 16 && /*exampleIcon*/ ctx[4] !== span.innerHTML) {
    				span.innerHTML = /*exampleIcon*/ ctx[4];
    			}

    			if (dirty & /*exampleIcon*/ 16) {
    				set_input_value(textarea1, /*exampleIcon*/ ctx[4]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div10, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Work', slots, []);
    	let exampleTitle = 'Example Work';
    	let exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!';
    	let editorCreated = true;
    	let identifier = null;
    	let location = 'work-01';
    	let language = 'pt-br';
    	let exampleIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z"/></svg>';
    	let Titles = [];
    	let Token = getCookie('token');

    	onMount(async () => {
    		checkLogged();
    		await feedUpdate();
    	});

    	const getLanguage = e => {
    		language = e.target.value;
    	};

    	const feedUpdate = async () => {
    		startRestLoading();
    		const res = await startARest('/work', 'GET', null, true, null, null, Token);

    		if (res != undefined) {
    			$$invalidate(5, Titles = res[0].getWorks);
    			setNewNotification('Serviços carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(5, Titles = 'Sem Serviços');
    		}

    		rollDown();
    	};

    	const createWord = async () => {
    		let json = {
    			location,
    			title: exampleTitle,
    			description: exampleLorem,
    			icon: exampleIcon,
    			language
    		};

    		await startARest('/work/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const updateWord = async () => {
    		let json = {
    			location,
    			title: exampleTitle,
    			description: exampleLorem,
    			icon: exampleIcon,
    			language
    		};

    		await startARest(`/work/update/${identifier}`, 'PUT', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			550
    		);
    	};

    	const deleteWord = async e => {
    		await startARest(`/work/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const startEditor = e => {
    		$$invalidate(0, exampleTitle = 'Example Work');
    		$$invalidate(1, exampleLorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi ex aliquam nesciunt repudiandae provident eius, rerum inventore veniam ducimus? Placeat animi illum repellat accusantium nemo beatae repudiandae. Aspernatur, magni quo!');
    		language = 'pt-br';
    		$$invalidate(4, exampleIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z"/></svg>');
    		$$invalidate(3, location = 'work-01');
    		$$invalidate(2, editorCreated = true);
    	};

    	const handleEditValue = e => {
    		let title = e.target.parentElement.parentElement.children[0].children[0].innerHTML;
    		let subtitle = e.target.parentElement.parentElement.children[0].children[1].innerHTML;
    		let locationHtml = e.target.parentElement.parentElement.children[0].children[2].innerHTML;
    		let languageHtml = e.target.parentElement.parentElement.children[0].children[3].innerHTML;
    		let iconHtml = e.target.parentElement.parentElement.children[0].children[4].innerHTML;
    		let ident = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		$$invalidate(0, exampleTitle = title);
    		$$invalidate(1, exampleLorem = subtitle);
    		identifier = ident;
    		$$invalidate(3, location = locationHtml);
    		language = languageHtml;
    		$$invalidate(4, exampleIcon = iconHtml);
    		$$invalidate(2, editorCreated = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Work> was created with unknown prop '${key}'`);
    	});

    	function span_input_handler(each_value, key) {
    		each_value[key].icon = this.innerHTML;
    		$$invalidate(5, Titles);
    	}

    	function input0_input_handler() {
    		exampleTitle = this.value;
    		$$invalidate(0, exampleTitle);
    	}

    	function input1_input_handler() {
    		location = this.value;
    		$$invalidate(3, location);
    	}

    	function textarea0_input_handler() {
    		exampleLorem = this.value;
    		$$invalidate(1, exampleLorem);
    	}

    	function span_input_handler_1() {
    		exampleIcon = this.innerHTML;
    		$$invalidate(4, exampleIcon);
    	}

    	function textarea1_input_handler() {
    		exampleIcon = this.value;
    		$$invalidate(4, exampleIcon);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		getCookie,
    		checkLogged,
    		rollDown,
    		exampleTitle,
    		exampleLorem,
    		editorCreated,
    		identifier,
    		location,
    		language,
    		exampleIcon,
    		Titles,
    		Token,
    		getLanguage,
    		feedUpdate,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('exampleTitle' in $$props) $$invalidate(0, exampleTitle = $$props.exampleTitle);
    		if ('exampleLorem' in $$props) $$invalidate(1, exampleLorem = $$props.exampleLorem);
    		if ('editorCreated' in $$props) $$invalidate(2, editorCreated = $$props.editorCreated);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    		if ('location' in $$props) $$invalidate(3, location = $$props.location);
    		if ('language' in $$props) language = $$props.language;
    		if ('exampleIcon' in $$props) $$invalidate(4, exampleIcon = $$props.exampleIcon);
    		if ('Titles' in $$props) $$invalidate(5, Titles = $$props.Titles);
    		if ('Token' in $$props) Token = $$props.Token;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		exampleTitle,
    		exampleLorem,
    		editorCreated,
    		location,
    		exampleIcon,
    		Titles,
    		getLanguage,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		span_input_handler,
    		input0_input_handler,
    		input1_input_handler,
    		textarea0_input_handler,
    		span_input_handler_1,
    		textarea1_input_handler
    	];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\editors\LeadsClient.svelte generated by Svelte v3.46.2 */
    const file$2 = "src\\editors\\LeadsClient.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Titles == 'string'}
    function create_if_block_5$1(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Titles*/ ctx[4]);
    			add_location(h3, file$2, 16, 16, 477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16) set_data_dev(t, /*Titles*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(16:12) {#if typeof Titles == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Titles != 'string'}
    function create_if_block_1$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*Titles*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles, deleteWord, handleEditValue*/ 656) {
    				each_value = /*Titles*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(22:12) {#if typeof Titles != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (26:28) {#if item.name}
    function create_if_block_4$1(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[15].name + "";
    	let t;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "devName");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[15].id);
    			add_location(span, file$2, 26, 32, 799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && t_value !== (t_value = /*item*/ ctx[15].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*Titles*/ 16 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[15].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(26:28) {#if item.name}",
    		ctx
    	});

    	return block;
    }

    // (31:28) {#if item.email}
    function create_if_block_3$2(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[15].email + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "devEmail");
    			add_location(span, file$2, 31, 32, 1044);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && t_value !== (t_value = /*item*/ ctx[15].email + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(31:28) {#if item.email}",
    		ctx
    	});

    	return block;
    }

    // (36:28) {#if item.telefone}
    function create_if_block_2$2(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[15].telefone + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "devDiscord");
    			add_location(span, file$2, 36, 32, 1276);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 16 && t_value !== (t_value = /*item*/ ctx[15].telefone + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(36:28) {#if item.telefone}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Titles as item, key}
    function create_each_block$1(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let div;
    	let i0;
    	let t3;
    	let i1;
    	let i1_data_id_value;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[15].name && create_if_block_4$1(ctx);
    	let if_block1 = /*item*/ ctx[15].email && create_if_block_3$2(ctx);
    	let if_block2 = /*item*/ ctx[15].telefone && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div = element("div");
    			i0 = element("i");
    			t3 = space();
    			i1 = element("i");
    			t4 = space();
    			add_location(p, file$2, 24, 24, 717);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$2, 42, 28, 1544);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[15].id);
    			add_location(i1, file$2, 43, 28, 1630);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$2, 41, 24, 1486);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$2, 23, 20, 667);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(li, t2);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t3);
    			append_dev(div, i1);
    			append_dev(li, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[9], false, false, false),
    					listen_dev(i1, "click", /*deleteWord*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[15].name) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[15].email) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$2(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[15].telefone) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2$2(ctx);
    					if_block2.c();
    					if_block2.m(p, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*Titles*/ 16 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[15].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(23:16) {#each Titles as item, key}",
    		ctx
    	});

    	return block;
    }

    // (68:8) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$2, 68, 12, 2446);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateWord*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(68:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (66:8) {#if editorCreated}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$2, 66, 12, 2353);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createWord*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(66:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div8;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div7;
    	let div6;
    	let div5;
    	let input0;
    	let t7;
    	let input1;
    	let t8;
    	let input2;
    	let t9;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Titles*/ ctx[4] == 'string' && create_if_block_5$1(ctx);
    	let if_block1 = typeof /*Titles*/ ctx[4] != 'string' && create_if_block_1$2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*editorCreated*/ ctx[3]) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			input0 = element("input");
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			input2 = element("input");
    			t9 = space();
    			if_block2.c();
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$2, 3, 12, 107);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$2, 2, 8, 70);
    			add_location(p, file$2, 6, 12, 224);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$2, 9, 12, 282);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$2, 5, 8, 160);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$2, 1, 4, 39);
    			attr_dev(ul, "class", "list-editors");
    			add_location(ul, file$2, 13, 8, 387);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$2, 12, 4, 344);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$2, 51, 4, 1840);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "name");
    			attr_dev(input0, "placeholder", "Nome");
    			add_location(input0, file$2, 56, 16, 1998);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "email");
    			attr_dev(input1, "placeholder", "Email");
    			add_location(input1, file$2, 57, 16, 2090);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "discord");
    			attr_dev(input2, "placeholder", "Telefone");
    			add_location(input2, file$2, 58, 16, 2183);
    			attr_dev(div5, "class", "input-control");
    			add_location(div5, file$2, 55, 12, 1953);
    			attr_dev(div6, "class", "four-inputs");
    			add_location(div6, file$2, 54, 8, 1914);
    			attr_dev(div7, "class", "content-creator");
    			add_location(div7, file$2, 52, 4, 1873);
    			attr_dev(div8, "class", "content word-editor");
    			add_location(div8, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div8, t3);
    			append_dev(div8, div3);
    			append_dev(div3, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t4);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(div8, t5);
    			append_dev(div8, div4);
    			append_dev(div8, t6);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, input0);
    			set_input_value(input0, /*devName*/ ctx[0]);
    			append_dev(div5, t7);
    			append_dev(div5, input1);
    			set_input_value(input1, /*devEmail*/ ctx[1]);
    			append_dev(div5, t8);
    			append_dev(div5, input2);
    			set_input_value(input2, /*devTelefone*/ ctx[2]);
    			append_dev(div7, t9);
    			if_block2.m(div7, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[8], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Titles*/ ctx[4] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5$1(ctx);
    					if_block0.c();
    					if_block0.m(ul, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Titles*/ ctx[4] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*devName*/ 1 && input0.value !== /*devName*/ ctx[0]) {
    				set_input_value(input0, /*devName*/ ctx[0]);
    			}

    			if (dirty & /*devEmail*/ 2 && input1.value !== /*devEmail*/ ctx[1]) {
    				set_input_value(input1, /*devEmail*/ ctx[1]);
    			}

    			if (dirty & /*devTelefone*/ 4 && input2.value !== /*devTelefone*/ ctx[2]) {
    				set_input_value(input2, /*devTelefone*/ ctx[2]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div7, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LeadsClient', slots, []);
    	let devName, devEmail, devTelefone;
    	let editorCreated = true;
    	let identifier = null;
    	let Titles = [];

    	onMount(async () => {
    		checkLogged();
    		await feedUpdate();
    	});

    	const feedUpdate = async () => {
    		//startRestLoading();
    		const res = await startARest('/client', 'GET');

    		if (res != undefined) {
    			$$invalidate(4, Titles = res[0].getLeads);
    			setNewNotification('Leads carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(4, Titles = 'Sem itens');
    		}

    		rollDown();
    	};

    	const createWord = async () => {
    		let json = {
    			name: devName,
    			email: devEmail,
    			tekefibe: devTelefone
    		};

    		await startARest('/client/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const updateWord = async () => {
    		let json = {
    			name: devName,
    			email: devEmail,
    			discord: devDiscord,
    			points: devPoints
    		};

    		await startARest(`/client/update/${identifier}`, 'PUT', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			550
    		);
    	};

    	const deleteWord = async e => {
    		await startARest(`/client/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const startEditor = e => {
    		$$invalidate(3, editorCreated = true);
    	};

    	const handleEditValue = e => {
    		identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		$$invalidate(0, devName = e.target.parentElement.parentElement.children[0].children[0].innerHTML);
    		$$invalidate(1, devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML);
    		$$invalidate(2, devTelefone = e.target.parentElement.parentElement.children[0].children[2].innerHTML);
    		$$invalidate(3, editorCreated = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LeadsClient> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		devName = this.value;
    		$$invalidate(0, devName);
    	}

    	function input1_input_handler() {
    		devEmail = this.value;
    		$$invalidate(1, devEmail);
    	}

    	function input2_input_handler() {
    		devTelefone = this.value;
    		$$invalidate(2, devTelefone);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		getCookie,
    		checkLogged,
    		rollDown,
    		devName,
    		devEmail,
    		devTelefone,
    		editorCreated,
    		identifier,
    		Titles,
    		feedUpdate,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('devName' in $$props) $$invalidate(0, devName = $$props.devName);
    		if ('devEmail' in $$props) $$invalidate(1, devEmail = $$props.devEmail);
    		if ('devTelefone' in $$props) $$invalidate(2, devTelefone = $$props.devTelefone);
    		if ('editorCreated' in $$props) $$invalidate(3, editorCreated = $$props.editorCreated);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    		if ('Titles' in $$props) $$invalidate(4, Titles = $$props.Titles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		devName,
    		devEmail,
    		devTelefone,
    		editorCreated,
    		Titles,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class LeadsClient extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LeadsClient",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\editors\Cases.svelte generated by Svelte v3.46.2 */
    const file$1 = "src\\editors\\Cases.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    // (16:12) {#if typeof Titles == 'string'}
    function create_if_block_9(ctx) {
    	let h3;
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(/*Titles*/ ctx[5]);
    			add_location(h3, file$1, 16, 16, 484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32) set_data_dev(t, /*Titles*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(16:12) {#if typeof Titles == 'string'}",
    		ctx
    	});

    	return block;
    }

    // (22:12) {#if typeof Titles != 'string'}
    function create_if_block_4(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*Titles*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles, deleteWord, handleEditValue*/ 2592) {
    				each_value_1 = /*Titles*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(22:12) {#if typeof Titles != 'string'}",
    		ctx
    	});

    	return block;
    }

    // (26:28) {#if item.businessPic}
    function create_if_block_8(ctx) {
    	let span;
    	let div;
    	let img;
    	let img_src_value;
    	let img_data_media_value;
    	let span_data_id_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/" + /*item*/ ctx[22].businessPic)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "data-media", img_data_media_value = /*item*/ ctx[22].businessPic);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 28, 40, 962);
    			attr_dev(div, "class", "mini-player");
    			add_location(div, file$1, 27, 36, 895);
    			attr_dev(span, "class", "businessPic");
    			attr_dev(span, "data-id", span_data_id_value = /*item*/ ctx[22].id);
    			add_location(span, file$1, 26, 32, 813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, div);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && !src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/" + /*item*/ ctx[22].businessPic)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*Titles*/ 32 && img_data_media_value !== (img_data_media_value = /*item*/ ctx[22].businessPic)) {
    				attr_dev(img, "data-media", img_data_media_value);
    			}

    			if (dirty & /*Titles*/ 32 && span_data_id_value !== (span_data_id_value = /*item*/ ctx[22].id)) {
    				attr_dev(span, "data-id", span_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(26:28) {#if item.businessPic}",
    		ctx
    	});

    	return block;
    }

    // (33:28) {#if item.businessName}
    function create_if_block_7(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[22].businessName + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "businessName");
    			add_location(span, file$1, 33, 32, 1291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[22].businessName + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(33:28) {#if item.businessName}",
    		ctx
    	});

    	return block;
    }

    // (38:28) {#if item.businessDescription}
    function create_if_block_6(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[22].businessDescription + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "businessDescription");
    			add_location(span, file$1, 38, 32, 1545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[22].businessDescription + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(38:28) {#if item.businessDescription}",
    		ctx
    	});

    	return block;
    }

    // (43:28) {#if item.businessLink}
    function create_if_block_5(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[22].businessLink + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "businessLink");
    			add_location(span, file$1, 43, 32, 1806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Titles*/ 32 && t_value !== (t_value = /*item*/ ctx[22].businessLink + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(43:28) {#if item.businessLink}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each Titles as item, key}
    function create_each_block_1(ctx) {
    	let li;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div;
    	let i0;
    	let t4;
    	let i1;
    	let i1_data_id_value;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block0 = /*item*/ ctx[22].businessPic && create_if_block_8(ctx);
    	let if_block1 = /*item*/ ctx[22].businessName && create_if_block_7(ctx);
    	let if_block2 = /*item*/ ctx[22].businessDescription && create_if_block_6(ctx);
    	let if_block3 = /*item*/ ctx[22].businessLink && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			div = element("div");
    			i0 = element("i");
    			t4 = space();
    			i1 = element("i");
    			t5 = space();
    			add_location(p, file$1, 24, 24, 724);
    			attr_dev(i0, "class", "fas fa-edit");
    			add_location(i0, file$1, 49, 28, 2080);
    			attr_dev(i1, "class", "fas fa-trash");
    			attr_dev(i1, "data-id", i1_data_id_value = /*item*/ ctx[22].id);
    			add_location(i1, file$1, 50, 28, 2166);
    			attr_dev(div, "class", "action-editors");
    			add_location(div, file$1, 48, 24, 2022);
    			attr_dev(li, "class", "item-editor");
    			add_location(li, file$1, 23, 20, 674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			if (if_block0) if_block0.m(p, null);
    			append_dev(p, t0);
    			if (if_block1) if_block1.m(p, null);
    			append_dev(p, t1);
    			if (if_block2) if_block2.m(p, null);
    			append_dev(p, t2);
    			if (if_block3) if_block3.m(p, null);
    			append_dev(li, t3);
    			append_dev(li, div);
    			append_dev(div, i0);
    			append_dev(div, t4);
    			append_dev(div, i1);
    			append_dev(li, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(i0, "click", /*handleEditValue*/ ctx[11], false, false, false),
    					listen_dev(i1, "click", /*deleteWord*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[22].businessPic) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					if_block0.m(p, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[22].businessName) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					if_block1.m(p, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*item*/ ctx[22].businessDescription) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_6(ctx);
    					if_block2.c();
    					if_block2.m(p, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*item*/ ctx[22].businessLink) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_5(ctx);
    					if_block3.c();
    					if_block3.m(p, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*Titles*/ 32 && i1_data_id_value !== (i1_data_id_value = /*item*/ ctx[22].id)) {
    				attr_dev(i1, "data-id", i1_data_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(23:16) {#each Titles as item, key}",
    		ctx
    	});

    	return block;
    }

    // (69:16) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Adicionar Logo";
    			attr_dev(button, "class", "btn first image-list");
    			add_location(button, file$1, 69, 20, 2825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*openModal*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(69:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:16) {#if devRender != undefined}
    function create_if_block_3$1(ctx) {
    	let div;
    	let i;
    	let t;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t = space();
    			img = element("img");
    			attr_dev(i, "class", "fas fa-times");
    			add_location(i, file$1, 65, 24, 2637);
    			if (!src_url_equal(img.src, img_src_value = /*devRender*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 66, 24, 2722);
    			attr_dev(div, "class", "image-control");
    			add_location(div, file$1, 64, 20, 2584);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*deletFeedDevMedia*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*devRender*/ 1 && !src_url_equal(img.src, img_src_value = /*devRender*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(64:16) {#if devRender != undefined}",
    		ctx
    	});

    	return block;
    }

    // (83:20) {#if Images.length <= 0}
    function create_if_block_2$1(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Não há imagens cadastradas";
    			add_location(h3, file$1, 83, 24, 3580);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(83:20) {#if Images.length <= 0}",
    		ctx
    	});

    	return block;
    }

    // (88:20) {#if Images.length >= 1}
    function create_if_block_1$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*Images*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Images, feedDevMedia*/ 8256) {
    				each_value = /*Images*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(88:20) {#if Images.length >= 1}",
    		ctx
    	});

    	return block;
    }

    // (89:24) {#each Images as item, i}
    function create_each_block(ctx) {
    	let li;
    	let p;
    	let span0;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let span1;
    	let t1_value = /*item*/ ctx[22].slice(47) + "";
    	let t1;
    	let t2;
    	let div1;
    	let i_1;
    	let i_1_data_id_value;
    	let t3;
    	let li_data_media_value;
    	let li_data_item_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			p = element("p");
    			span0 = element("span");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			i_1 = element("i");
    			t3 = space();
    			if (!src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/" + /*item*/ ctx[22])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*item*/ ctx[22].slice(47));
    			add_location(img, file$1, 93, 44, 4082);
    			attr_dev(div0, "class", "mini-player");
    			add_location(div0, file$1, 92, 40, 4011);
    			add_location(span0, file$1, 91, 36, 3963);
    			add_location(span1, file$1, 96, 36, 4305);
    			add_location(p, file$1, 90, 32, 3922);
    			attr_dev(i_1, "class", "fas fa-file");
    			attr_dev(i_1, "data-id", i_1_data_id_value = /*item*/ ctx[22].id);
    			add_location(i_1, file$1, 101, 36, 4552);
    			attr_dev(div1, "class", "action-editors");
    			add_location(div1, file$1, 100, 32, 4486);
    			attr_dev(li, "class", "item-editor");
    			attr_dev(li, "data-media", li_data_media_value = /*item*/ ctx[22]);
    			attr_dev(li, "data-item", li_data_item_value = /*item*/ ctx[22]);
    			add_location(li, file$1, 89, 28, 3825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, p);
    			append_dev(p, span0);
    			append_dev(span0, div0);
    			append_dev(div0, img);
    			append_dev(p, t0);
    			append_dev(p, span1);
    			append_dev(span1, t1);
    			append_dev(li, t2);
    			append_dev(li, div1);
    			append_dev(div1, i_1);
    			append_dev(li, t3);

    			if (!mounted) {
    				dispose = listen_dev(i_1, "click", /*feedDevMedia*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Images*/ 64 && !src_url_equal(img.src, img_src_value = "https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/" + /*item*/ ctx[22])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*Images*/ 64 && img_alt_value !== (img_alt_value = /*item*/ ctx[22].slice(47))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*Images*/ 64 && t1_value !== (t1_value = /*item*/ ctx[22].slice(47) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*Images*/ 64 && i_1_data_id_value !== (i_1_data_id_value = /*item*/ ctx[22].id)) {
    				attr_dev(i_1, "data-id", i_1_data_id_value);
    			}

    			if (dirty & /*Images*/ 64 && li_data_media_value !== (li_data_media_value = /*item*/ ctx[22])) {
    				attr_dev(li, "data-media", li_data_media_value);
    			}

    			if (dirty & /*Images*/ 64 && li_data_item_value !== (li_data_item_value = /*item*/ ctx[22])) {
    				attr_dev(li, "data-item", li_data_item_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(89:24) {#each Images as item, i}",
    		ctx
    	});

    	return block;
    }

    // (117:8) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Atualizar";
    			attr_dev(button, "class", "btn second");
    			add_location(button, file$1, 117, 12, 4965);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*updateWord*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(117:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (115:8) {#if editorCreated}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Criar";
    			attr_dev(button, "class", "btn first");
    			add_location(button, file$1, 115, 12, 4872);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createWord*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(115:8) {#if editorCreated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div10;
    	let div2;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let p;
    	let t2;
    	let i1;
    	let t3;
    	let div3;
    	let ul0;
    	let t4;
    	let t5;
    	let div4;
    	let t6;
    	let div9;
    	let div6;
    	let div5;
    	let t7;
    	let input0;
    	let t8;
    	let input1;
    	let t9;
    	let textarea;
    	let t10;
    	let div8;
    	let i2;
    	let t11;
    	let div7;
    	let ul1;
    	let t12;
    	let t13;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*Titles*/ ctx[5] == 'string' && create_if_block_9(ctx);
    	let if_block1 = typeof /*Titles*/ ctx[5] != 'string' && create_if_block_4(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*devRender*/ ctx[0] != undefined) return create_if_block_3$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block2 = current_block_type(ctx);
    	let if_block3 = /*Images*/ ctx[6].length <= 0 && create_if_block_2$1(ctx);
    	let if_block4 = /*Images*/ ctx[6].length >= 1 && create_if_block_1$1(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*editorCreated*/ ctx[4]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block5 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Criar";
    			t2 = space();
    			i1 = element("i");
    			t3 = space();
    			div3 = element("div");
    			ul0 = element("ul");
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			div4 = element("div");
    			t6 = space();
    			div9 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			if_block2.c();
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			textarea = element("textarea");
    			t10 = space();
    			div8 = element("div");
    			i2 = element("i");
    			t11 = space();
    			div7 = element("div");
    			ul1 = element("ul");
    			if (if_block3) if_block3.c();
    			t12 = space();
    			if (if_block4) if_block4.c();
    			t13 = space();
    			if_block5.c();
    			attr_dev(i0, "class", "fas fa-list");
    			add_location(i0, file$1, 3, 12, 114);
    			attr_dev(div0, "class", "list-icon");
    			add_location(div0, file$1, 2, 8, 77);
    			add_location(p, file$1, 6, 12, 231);
    			attr_dev(i1, "class", "fas fa-magic");
    			add_location(i1, file$1, 9, 12, 289);
    			attr_dev(div1, "class", "action-create");
    			add_location(div1, file$1, 5, 8, 167);
    			attr_dev(div2, "class", "actions");
    			add_location(div2, file$1, 1, 4, 46);
    			attr_dev(ul0, "class", "list-editors");
    			add_location(ul0, file$1, 13, 8, 394);
    			attr_dev(div3, "class", "list-inside-content");
    			add_location(div3, file$1, 12, 4, 351);
    			attr_dev(div4, "class", "divider");
    			add_location(div4, file$1, 58, 4, 2376);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "email");
    			attr_dev(input0, "placeholder", "Nome do cliente");
    			add_location(input0, file$1, 71, 16, 2951);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "points");
    			attr_dev(input1, "placeholder", "Link do cliente");
    			add_location(input1, file$1, 72, 16, 3054);
    			attr_dev(textarea, "type", "text");
    			attr_dev(textarea, "class", "name");
    			attr_dev(textarea, "placeholder", "Descrição");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "cols", "33");
    			add_location(textarea, file$1, 73, 16, 3160);
    			attr_dev(div5, "class", "input-control");
    			add_location(div5, file$1, 62, 12, 2489);
    			attr_dev(div6, "class", "four-inputs");
    			add_location(div6, file$1, 61, 8, 2450);
    			attr_dev(i2, "class", "fas fa-times");
    			add_location(i2, file$1, 79, 12, 3369);
    			attr_dev(ul1, "class", "list-editors");
    			add_location(ul1, file$1, 81, 16, 3483);
    			attr_dev(div7, "class", "modal image-list");
    			add_location(div7, file$1, 80, 12, 3435);
    			attr_dev(div8, "class", "modal-controller unview");
    			add_location(div8, file$1, 78, 8, 3318);
    			attr_dev(div9, "class", "content-creator");
    			add_location(div9, file$1, 59, 4, 2409);
    			attr_dev(div10, "class", "content word-editor collab");
    			add_location(div10, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div2);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, i1);
    			append_dev(div10, t3);
    			append_dev(div10, div3);
    			append_dev(div3, ul0);
    			if (if_block0) if_block0.m(ul0, null);
    			append_dev(ul0, t4);
    			if (if_block1) if_block1.m(ul0, null);
    			append_dev(div10, t5);
    			append_dev(div10, div4);
    			append_dev(div10, t6);
    			append_dev(div10, div9);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			if_block2.m(div5, null);
    			append_dev(div5, t7);
    			append_dev(div5, input0);
    			set_input_value(input0, /*devEmail*/ ctx[1]);
    			append_dev(div5, t8);
    			append_dev(div5, input1);
    			set_input_value(input1, /*devDiscord*/ ctx[2]);
    			append_dev(div5, t9);
    			append_dev(div5, textarea);
    			set_input_value(textarea, /*devDescription*/ ctx[3]);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			append_dev(div8, i2);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			append_dev(div7, ul1);
    			if (if_block3) if_block3.m(ul1, null);
    			append_dev(ul1, t12);
    			if (if_block4) if_block4.m(ul1, null);
    			append_dev(div9, t13);
    			if_block5.m(div9, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*startEditor*/ ctx[10], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[16]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[17]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[18]),
    					listen_dev(i2, "click", /*closeModal*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*Titles*/ ctx[5] == 'string') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					if_block0.m(ul0, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (typeof /*Titles*/ ctx[5] != 'string') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(ul0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div5, t7);
    				}
    			}

    			if (dirty & /*devEmail*/ 2 && input0.value !== /*devEmail*/ ctx[1]) {
    				set_input_value(input0, /*devEmail*/ ctx[1]);
    			}

    			if (dirty & /*devDiscord*/ 4 && input1.value !== /*devDiscord*/ ctx[2]) {
    				set_input_value(input1, /*devDiscord*/ ctx[2]);
    			}

    			if (dirty & /*devDescription*/ 8) {
    				set_input_value(textarea, /*devDescription*/ ctx[3]);
    			}

    			if (/*Images*/ ctx[6].length <= 0) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_2$1(ctx);
    					if_block3.c();
    					if_block3.m(ul1, t12);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*Images*/ ctx[6].length >= 1) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_1$1(ctx);
    					if_block4.c();
    					if_block4.m(ul1, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block5) {
    				if_block5.p(ctx, dirty);
    			} else {
    				if_block5.d(1);
    				if_block5 = current_block_type_1(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div9, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if_block5.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cases', slots, []);
    	let devName, devRender, devEmail, devDiscord, devDescription;
    	let editorCreated = true;
    	let identifier = null;
    	let Titles = [];
    	let Images = [];

    	onMount(async () => {
    		checkLogged();
    		feedUpdate();
    	});

    	const feedUpdate = async () => {
    		//startRestLoading();
    		const res = await startARest('/cases', 'GET');

    		if (res != undefined) {
    			$$invalidate(5, Titles = res[0].getCollabs);
    			setNewNotification('Cases carregados com sucesso!', 'success');
    		} else {
    			$$invalidate(5, Titles = 'Sem itens');
    		}

    		const imgs = await startARest('/media/list', 'GET', null);

    		if (imgs != undefined) {
    			let treatImages = imgs[0].listStream;
    			let treatedImages = [];

    			treatImages.filter(media => {
    				if (media.replace('media/', '').length != 0) {
    					treatedImages.push(media);
    				}
    			});

    			$$invalidate(6, Images = treatedImages);
    			setNewNotification('Imagens carregadas com sucesso!', 'success');
    		} else {
    			$$invalidate(6, Images = 'Imagens não cadastradas');
    		}

    		rollDown();
    	};

    	const createWord = async () => {
    		let json = {
    			picture: devName,
    			name: devEmail,
    			description: devDescription,
    			link: devDiscord == undefined
    			? $$invalidate(2, devDiscord = '')
    			: devDiscord
    		};

    		await startARest('/cases/create', 'POST', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const updateWord = async () => {
    		let json = {
    			picture: devName,
    			name: devEmail,
    			description: devDescription,
    			link: devDiscord == undefined
    			? $$invalidate(2, devDiscord = '')
    			: devDiscord
    		};

    		await startARest(`/cases/update/${identifier}`, 'PUT', json);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			550
    		);
    	};

    	const deleteWord = async e => {
    		await startARest(`/cases/delete/${e.target.dataset.id}`, 'DELETE', null);

    		setTimeout(
    			() => {
    				feedUpdate();
    			},
    			500
    		);
    	};

    	const startEditor = e => {
    		(devName = '', $$invalidate(0, devRender = undefined), $$invalidate(1, devEmail = ''), $$invalidate(2, devDiscord = ''), $$invalidate(3, devDescription = ''));
    		$$invalidate(4, editorCreated = true);
    	};

    	const handleEditValue = e => {
    		identifier = e.target.parentElement.parentElement.children[0].children[0].dataset.id;
    		devName = e.target.parentElement.parentElement.children[0].children[0].children[0].children[0].dataset.media;
    		$$invalidate(0, devRender = e.target.parentElement.parentElement.children[0].children[0].children[0].children[0].src);
    		$$invalidate(1, devEmail = e.target.parentElement.parentElement.children[0].children[1].innerHTML);
    		$$invalidate(3, devDescription = e.target.parentElement.parentElement.children[0].children[2].innerHTML);

    		$$invalidate(2, devDiscord = e.target.parentElement.parentElement.children[0].children[3] == undefined
    		? ''
    		: e.target.parentElement.parentElement.children[0].children[3].innerHTML);

    		$$invalidate(4, editorCreated = false);
    	};

    	const deletFeedDevMedia = () => {
    		$$invalidate(0, devRender = undefined);
    		devName = undefined;
    	};

    	const feedDevMedia = e => {
    		devName = e.target.parentElement.parentElement.dataset.media;
    		$$invalidate(0, devRender = `https://cdnlucashiagoio.s3.sa-east-1.amazonaws.com/${devName}`);
    		closeModal();
    	};

    	const openModal = () => {
    		let modalController = document.querySelector('.modal-controller');
    		modalController.classList.remove('unview');
    	};

    	const closeModal = () => {
    		let modalController = document.querySelector('.modal-controller');
    		modalController.classList.add('unview');
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cases> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		devEmail = this.value;
    		$$invalidate(1, devEmail);
    	}

    	function input1_input_handler() {
    		devDiscord = this.value;
    		$$invalidate(2, devDiscord);
    	}

    	function textarea_input_handler() {
    		devDescription = this.value;
    		$$invalidate(3, devDescription);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		startARest,
    		startRestLoading,
    		setNewNotification,
    		getCookie,
    		checkLogged,
    		rollDown,
    		devName,
    		devRender,
    		devEmail,
    		devDiscord,
    		devDescription,
    		editorCreated,
    		identifier,
    		Titles,
    		Images,
    		feedUpdate,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		deletFeedDevMedia,
    		feedDevMedia,
    		openModal,
    		closeModal
    	});

    	$$self.$inject_state = $$props => {
    		if ('devName' in $$props) devName = $$props.devName;
    		if ('devRender' in $$props) $$invalidate(0, devRender = $$props.devRender);
    		if ('devEmail' in $$props) $$invalidate(1, devEmail = $$props.devEmail);
    		if ('devDiscord' in $$props) $$invalidate(2, devDiscord = $$props.devDiscord);
    		if ('devDescription' in $$props) $$invalidate(3, devDescription = $$props.devDescription);
    		if ('editorCreated' in $$props) $$invalidate(4, editorCreated = $$props.editorCreated);
    		if ('identifier' in $$props) identifier = $$props.identifier;
    		if ('Titles' in $$props) $$invalidate(5, Titles = $$props.Titles);
    		if ('Images' in $$props) $$invalidate(6, Images = $$props.Images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		devRender,
    		devEmail,
    		devDiscord,
    		devDescription,
    		editorCreated,
    		Titles,
    		Images,
    		createWord,
    		updateWord,
    		deleteWord,
    		startEditor,
    		handleEditValue,
    		deletFeedDevMedia,
    		feedDevMedia,
    		openModal,
    		closeModal,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler
    	];
    }

    class Cases extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cases",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    /* src\App.svelte generated by Svelte v3.46.2 */
    const file = "src\\App.svelte";

    // (40:1) {:else}
    function create_else_block(ctx) {
    	let section;
    	let switch_instance;
    	let current;
    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*params*/ ctx[2] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(section, "class", "checkout");
    			add_location(section, file, 40, 2, 814);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*params*/ 4) switch_instance_changes.params = /*params*/ ctx[2];

    			if (switch_value !== (switch_value = /*page*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(40:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:38) 
    function create_if_block_3(ctx) {
    	let section;
    	let switch_instance;
    	let current;
    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*params*/ ctx[2] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(section, "class", "Unauthorized");
    			add_location(section, file, 34, 2, 694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*params*/ 4) switch_instance_changes.params = /*params*/ ctx[2];

    			if (switch_value !== (switch_value = /*page*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(34:38) ",
    		ctx
    	});

    	return block;
    }

    // (27:31) 
    function create_if_block_2(ctx) {
    	let section;
    	let switch_instance;
    	let current;
    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*params*/ ctx[2] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(section, "class", "Login");
    			add_location(section, file, 28, 2, 551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty & /*params*/ 4) switch_instance_changes.params = /*params*/ ctx[2];

    			if (switch_value !== (switch_value = /*page*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(27:31) ",
    		ctx
    	});

    	return block;
    }

    // (9:1) {#if thispage != 'Checkout' && thispage != 'Login' && thispage != 'Unauthorized'}
    function create_if_block(ctx) {
    	let div;
    	let sidebar;
    	let t0;
    	let section;
    	let switch_instance;
    	let t1;
    	let current;

    	sidebar = new Sidebar({
    			props: { sidebar_items: /*sidebar_routes*/ ctx[3] },
    			$$inline: true
    		});

    	var switch_value = /*page*/ ctx[0];

    	function switch_props(ctx) {
    		return {
    			props: { params: /*params*/ ctx[2] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	let if_block = !/*buttonOff*/ ctx[4] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(sidebar.$$.fragment);
    			t0 = space();
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			add_location(section, file, 15, 4, 303);
    			attr_dev(div, "class", "main");
    			add_location(div, file, 11, 2, 227);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(sidebar, div, null);
    			append_dev(div, t0);
    			append_dev(div, section);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			append_dev(section, t1);
    			if (if_block) if_block.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sidebar_changes = {};
    			if (dirty & /*sidebar_routes*/ 8) sidebar_changes.sidebar_items = /*sidebar_routes*/ ctx[3];
    			sidebar.$set(sidebar_changes);
    			const switch_instance_changes = {};
    			if (dirty & /*params*/ 4) switch_instance_changes.params = /*params*/ ctx[2];

    			if (switch_value !== (switch_value = /*page*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, t1);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!/*buttonOff*/ ctx[4]) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(sidebar);
    			if (switch_instance) destroy_component(switch_instance);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(9:1) {#if thispage != 'Checkout' && thispage != 'Login' && thispage != 'Unauthorized'}",
    		ctx
    	});

    	return block;
    }

    // (20:5) {#if !buttonOff}
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Teste de disparo";
    			add_location(button, file, 20, 6, 407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", actionExample, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:5) {#if !buttonOff}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link;
    	let t0;
    	let main;
    	let header;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let div;
    	let current;

    	header = new Header({
    			props: { title: 'Dashboard Squadevops' },
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block, create_if_block_2, create_if_block_3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*thispage*/ ctx[1] != 'Checkout' && /*thispage*/ ctx[1] != 'Login' && /*thispage*/ ctx[1] != 'Unauthorized') return 0;
    		if (/*thispage*/ ctx[1] == 'Login') return 1;
    		if (/*thispage*/ ctx[1] == 'Unauthorized') return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			create_component(header.$$.fragment);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			div = element("div");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "/css/main.css");
    			add_location(link, file, 1, 1, 16);
    			add_location(main, file, 4, 0, 80);
    			attr_dev(div, "class", "notifications-controller");
    			add_location(div, file, 49, 0, 939);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t1);
    			if_blocks[current_block_type_index].m(main, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function actionExample() {
    	
    } //console.log('action occurs');

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let page$1;
    	let thispage;
    	let params;

    	page(
    		'/',
    		(ctx, next) => {
    			$$invalidate(2, params = ctx.params);
    			$$invalidate(1, thispage = 'Login');
    			next();
    		},
    		() => $$invalidate(0, page$1 = Login)
    	);

    	page(
    		'/user',
    		(ctx, next) => {
    			$$invalidate(2, params = ctx.params);
    			next();
    		},
    		() => $$invalidate(0, page$1 = Dash)
    	);

    	page(
    		'/checkout',
    		(ctx, next) => {
    			$$invalidate(1, thispage = 'Checkout');
    			next();
    		},
    		() => $$invalidate(0, page$1 = Checkout)
    	);

    	page(
    		'/leads',
    		(ctx, next) => {
    			$$invalidate(2, params = ctx.params);
    			next();
    		},
    		() => $$invalidate(0, page$1 = Leads)
    	);

    	page('/quest', () => $$invalidate(0, page$1 = Quests));
    	page('/faq', () => $$invalidate(0, page$1 = Questions));
    	page('/client', () => $$invalidate(0, page$1 = QuestionsClients));
    	page('/clientl', () => $$invalidate(0, page$1 = LeadsClient));
    	page('/collab', () => $$invalidate(0, page$1 = Collab));
    	page('/cases', () => $$invalidate(0, page$1 = Cases));
    	page('/word', () => $$invalidate(0, page$1 = Word));
    	page('/work', () => $$invalidate(0, page$1 = Work));
    	page('/video', () => $$invalidate(0, page$1 = Video));

    	page(
    		'/image',
    		(ctx, next) => {
    			$$invalidate(2, params = ctx.params);
    			next();
    		},
    		() => $$invalidate(0, page$1 = Image)
    	);

    	page('/audio', () => $$invalidate(0, page$1 = Audio));
    	page('/payment', () => $$invalidate(0, page$1 = Payment_1));
    	page('/codes', () => $$invalidate(0, page$1 = Codes));
    	page('/skills', () => $$invalidate(0, page$1 = Skills_1));

    	page(
    		'/unauthorized',
    		(ctx, next) => {
    			$$invalidate(2, params = ctx.params);
    			$$invalidate(1, thispage = 'Unauthorized');
    			next();
    		},
    		() => $$invalidate(0, page$1 = Unauthorized)
    	);

    	page('/*', () => $$invalidate(0, page$1 = NotFound));
    	page.start();
    	let sidebar_routes;
    	routesArray.subscribe(routes => $$invalidate(3, sidebar_routes = routes));
    	let buttonOff = true;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		routesArray,
    		Header,
    		Sidebar,
    		Dash,
    		NotFound,
    		Checkout,
    		Login,
    		Unauthorized,
    		Word,
    		Video,
    		Image,
    		Audio,
    		Payment: Payment_1,
    		Codes,
    		Skills: Skills_1,
    		Lead: Leads,
    		Quest: Quests,
    		Questions,
    		QClients: QuestionsClients,
    		Collab,
    		Work,
    		ClientLeads: LeadsClient,
    		Cases,
    		router: page,
    		page: page$1,
    		thispage,
    		params,
    		sidebar_routes,
    		buttonOff,
    		actionExample
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page$1 = $$props.page);
    		if ('thispage' in $$props) $$invalidate(1, thispage = $$props.thispage);
    		if ('params' in $$props) $$invalidate(2, params = $$props.params);
    		if ('sidebar_routes' in $$props) $$invalidate(3, sidebar_routes = $$props.sidebar_routes);
    		if ('buttonOff' in $$props) $$invalidate(4, buttonOff = $$props.buttonOff);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page$1, thispage, params, sidebar_routes, buttonOff];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
