class E {
	constructor(e) {
		(this.options = Object.assign(
			{
				logLevel: "info",
				path: "",
				publicPath: "",
				reduceInlineStyles: !0,
				pruneSource: !1,
				additionalStylesheets: [],
				allowRules: [],
			},
			e || {},
		)),
			(this.urlFilter = this.options.filter),
			this.urlFilter instanceof RegExp &&
				(this.urlFilter = this.urlFilter.test.bind(this.urlFilter)),
			(this.logger =
				this.options.logger || createLogger(this.options.logLevel));
	}
	readFile(e) {
		const s = this.fs;
		return new Promise((r, t) => {
			const i = (n, a) => {
				n ? t(n) : r(a);
			};
			s && s.readFile ? s.readFile(e, i) : readFile(e, "utf8", i);
		});
	}
	async process(e) {
		const s = process.hrtime.bigint(),
			r = createDocument(e);
		if (
			(this.options.additionalStylesheets.length > 0 &&
				this.embedAdditionalStylesheet(r),
			this.options.external !== !1)
		) {
			const a = [].slice.call(
				r.querySelectorAll('link[rel="stylesheet"]'),
			);
			await Promise.all(a.map((u) => this.embedLinkedStylesheet(u, r)));
		}
		const t = this.getAffectedStyleTags(r);
		await Promise.all(t.map((a) => this.processStyle(a, r))),
			this.options.mergeStylesheets !== !1 &&
				t.length !== 0 &&
				(await this.mergeStylesheets(r));
		const i = serializeDocument(r),
			n = process.hrtime.bigint();
		return this.logger.info("Time " + parseFloat(n - s) / 1e6), i;
	}
	getAffectedStyleTags(e) {
		const s = [].slice.call(e.querySelectorAll("style"));
		return this.options.reduceInlineStyles === !1
			? s.filter((r) => r.$$external)
			: s;
	}
	async mergeStylesheets(e) {
		const s = this.getAffectedStyleTags(e);
		if (s.length === 0) {
			this.logger.warn(
				"Merging inline stylesheets into a single <style> tag skipped, no inline stylesheets to merge",
			);
			return;
		}
		const r = s[0];
		let t = r.textContent;
		for (let i = 1; i < s.length; i++) {
			const n = s[i];
			(t += n.textContent), n.remove();
		}
		r.textContent = t;
	}
	async getCssAsset(e) {
		const s = this.options.path,
			r = this.options.publicPath;
		let t = e.replace(/^\//, "");
		const i = (r || "").replace(/(^\/|\/$)/g, "") + "/";
		if (
			(t.indexOf(i) === 0 &&
				(t = t.substring(i.length).replace(/^\//, "")),
			/^https?:\/\//.test(t) || e.startsWith("//"))
		)
			return;
		const n = path.resolve(s, t);
		let a;
		try {
			a = await this.readFile(n);
		} catch {
			this.logger.warn(`Unable to locate stylesheet: ${n}`);
		}
		return a;
	}
	checkInlineThreshold(e, s, r) {
		if (
			this.options.inlineThreshold &&
			r.length < this.options.inlineThreshold
		) {
			const t = s.$$name;
			return (
				(s.$$reduce = !1),
				this.logger.info(
					`\x1B[32mInlined all of ${t} (${r.length} was below the threshold of ${this.options.inlineThreshold})\x1B[39m`,
				),
				e.remove(),
				!0
			);
		}
		return !1;
	}
	async embedAdditionalStylesheet(e) {
		const s = [];
		(
			await Promise.all(
				this.options.additionalStylesheets.map((t) => {
					if (s.includes(t)) return;
					s.push(t);
					const i = e.createElement("style");
					return (
						(i.$$external = !0),
						this.getCssAsset(t, i).then((n) => [n, i])
					);
				}),
			)
		).forEach(([t, i]) => {
			t && ((i.textContent = t), e.head.appendChild(i));
		});
	}
	async embedLinkedStylesheet(e, s) {
		const r = e.getAttribute("href"),
			t = e.getAttribute("media"),
			i = this.options.preload;
		if (this.urlFilter ? this.urlFilter(r) : !(r || "").match(/\.css$/))
			return Promise.resolve();
		const n = s.createElement("style");
		n.$$external = !0;
		const a = await this.getCssAsset(r, n);
		if (
			!a ||
			((n.textContent = a),
			(n.$$name = r),
			(n.$$links = [e]),
			e.parentNode.insertBefore(n, e),
			this.checkInlineThreshold(e, n, a))
		)
			return;
		let u =
			"function $loadcss(u,m,l){(l=document.createElement('link')).rel='stylesheet';l.href=u;document.head.appendChild(l)}";
		const g = i === "js-lazy";
		if (
			(g &&
				(u = u.replace(
					"l.href",
					"l.media='print';l.onload=function(){l.media=m};l.href",
				)),
			i === !1)
		)
			return;
		let p = !1;
		if (i === "body") s.body.appendChild(e);
		else if (
			(e.setAttribute("rel", "preload"),
			e.setAttribute("as", "style"),
			i === "js" || i === "js-lazy")
		) {
			const h = s.createElement("script"),
				d = `${u}$loadcss(${JSON.stringify(r)}${
					g ? "," + JSON.stringify(t || "all") : ""
				})`;
			(h.textContent = d),
				e.parentNode.insertBefore(h, e.nextSibling),
				n.$$links.push(h),
				(u = ""),
				(p = !0);
		} else if (i === "media")
			e.setAttribute("rel", "stylesheet"),
				e.removeAttribute("as"),
				e.setAttribute("media", "print"),
				e.setAttribute("onload", `this.media='${t || "all"}'`),
				(p = !0);
		else if (i === "swap-high")
			e.setAttribute("rel", "alternate stylesheet preload"),
				e.setAttribute("title", "styles"),
				e.setAttribute("onload", "this.title='';this.rel='stylesheet'"),
				(p = !0);
		else if (i === "swap")
			e.setAttribute("onload", "this.rel='stylesheet'"), (p = !0);
		else {
			const h = s.createElement("link");
			h.setAttribute("rel", "stylesheet"),
				t && h.setAttribute("media", t),
				h.setAttribute("href", r),
				s.body.appendChild(h),
				n.$$links.push(h);
		}
		if (this.options.noscriptFallback !== !1 && p) {
			const h = s.createElement("noscript"),
				d = s.createElement("link");
			d.setAttribute("rel", "stylesheet"),
				d.setAttribute("href", r),
				t && d.setAttribute("media", t),
				h.appendChild(d),
				e.parentNode.insertBefore(h, e.nextSibling),
				n.$$links.push(h);
		}
	}
	pruneSource(e, s, r) {
		const t = this.options.minimumExternalSize,
			i = e.$$name;
		if (t && r.length < t) {
			if (
				(this.logger.info(
					`\x1B[32mInlined all of ${i} (non-critical external stylesheet would have been ${r.length}b, which was below the threshold of ${t})\x1B[39m`,
				),
				(e.textContent = s),
				e.$$links)
			)
				for (const n of e.$$links) {
					const a = n.parentNode;
					a && a.removeChild(n);
				}
			return !0;
		}
		return !1;
	}
	async processStyle(e, s) {
		if (e.$$reduce === !1) return;
		const r = e.$$name ? e.$$name.replace(/^\//, "") : "inline CSS",
			t = this.options,
			i = s.crittersContainer;
		let n = t.keyframes || "critical";
		n === !0 && (n = "all"), n === !1 && (n = "none");
		let a = e.textContent;
		const u = a;
		if (!a) return;
		const g = parseStylesheet(a),
			p = t.pruneSource ? parseStylesheet(a) : null;
		let h = "";
		const d = [],
			w = [];
		let y = !1,
			b = !1,
			$ = !1,
			S = !1;
		walkStyleRules(
			g,
			markOnly((o) => {
				if (o.type === "comment") {
					const l = o.text.trim();
					if (l.startsWith("critters"))
						switch (l.replace(/^critters:/, "")) {
							case "include":
								y = !0;
								break;
							case "exclude":
								$ = !0;
								break;
							case "include start":
								b = !0;
								break;
							case "include end":
								b = !1;
								break;
							case "exclude start":
								S = !0;
								break;
							case "exclude end":
								S = !1;
								break;
						}
				}
				if (o.type === "rule") {
					if (y) return (y = !1), !0;
					if ($) return ($ = !1), !1;
					if (b) return !0;
					if (
						S ||
						(o.filterSelectors((l) => {
							if (
								t.allowRules.some((f) =>
									f instanceof RegExp ? f.test(l) : f === l,
								) ||
								l === ":root" ||
								l.match(/^::?(before|after)$/) ||
								l === "html" ||
								l === "body"
							)
								return !0;
							if (
								((l = l
									.replace(
										/(?<!\\)::?[a-z-]+(?![a-z-(])/gi,
										"",
									)
									.replace(/::?not\(\s*\)/g, "")
									.replace(/\(\s*,/g, "(")
									.replace(/,\s*\)/g, ")")
									.trim()),
								!l)
							)
								return !1;
							try {
								return i.exists(l);
							} catch (f) {
								return d.push(l + " -> " + f.message), !1;
							}
						}),
						!o.selector)
					)
						return !1;
					if (o.nodes)
						for (let l = 0; l < o.nodes.length; l++) {
							const c = o.nodes[l];
							if (
								(c.prop?.match(/\bfont(-family)?\b/i) &&
									(h += ` ${c.value}`),
								c.prop === "animation" ||
									c.prop === "animation-name")
							) {
								const f = c.value.split(/\s+/);
								for (let x = 0; x < f.length; x++) {
									const v = f[x].trim();
									v && w.push(v);
								}
							}
						}
				}
				if (o.type === "atrule" && o.name === "font-face") return;
				const m = o.nodes && o.nodes.filter((l) => !l.$$remove);
				return !m || m.length !== 0;
			}),
		),
			d.length !== 0 &&
				this.logger.warn(`${d.length} rules skipped due to selector errors:
  ${d.join(`
  `)}`);
		const k = t.fonts === !0 || t.preloadFonts === !0,
			P = t.fonts !== !1 && t.inlineFonts === !0,
			C = [];
		if (
			(walkStyleRulesWithReverseMirror(g, p, (o) => {
				if (o.$$remove === !0) return !1;
				if (
					(applyMarkedSelectors(o),
					o.type === "atrule" && o.name === "keyframes")
				)
					return n === "none"
						? !1
						: n === "all"
						  ? !0
						  : w.indexOf(o.params) !== -1;
				if (o.type === "atrule" && o.name === "font-face") {
					let m, l;
					for (let c = 0; c < o.nodes.length; c++) {
						const f = o.nodes[c];
						f.prop === "src"
							? (l = (f.value.match(
									/url\s*\(\s*(['"]?)(.+?)\1\s*\)/,
							  ) || [])[2])
							: f.prop === "font-family" && (m = f.value);
					}
					if (l && k && C.indexOf(l) === -1) {
						C.push(l);
						const c = s.createElement("link");
						c.setAttribute("rel", "preload"),
							c.setAttribute("as", "font"),
							c.setAttribute("crossorigin", "anonymous"),
							c.setAttribute("href", l.trim()),
							s.head.appendChild(c);
					}
					if (!(m && l) || h.indexOf(m) === -1 || !P) return !1;
				}
			}),
			(a = serializeStylesheet(g, {
				compress: this.options.compress !== !1,
			})),
			a.trim().length === 0)
		) {
			e.parentNode && e.remove();
			return;
		}
		let F = "",
			A = !1;
		if (t.pruneSource) {
			const o = serializeStylesheet(p, {
				compress: this.options.compress !== !1,
			});
			(A = this.pruneSource(e, u, o)),
				A &&
					(F = `, reducing non-inlined size ${
						((o.length / u.length) * 100) | 0
					}% to ${prettyBytes(o.length)}`);
		}
		A || (e.textContent = a);
		const z = ((a.length / u.length) * 100) | 0;
		this.logger.info(
			`\x1B[32mInlined ${prettyBytes(
				a.length,
			)} (${z}% of original ${prettyBytes(
				u.length,
			)}) of ${r}${F}.\x1B[39m`,
		);
	}
}
export { E as default };
