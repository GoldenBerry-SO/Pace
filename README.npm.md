# pace-tools

The CLI for [Pace](https://pace.tools): AI specialists for every role at your company. Sales,
marketing, engineering, data, finance, legal, ops, HR, product, design, and more, each one a Claude
Code plugin connected to the tools that team already uses.

`pace-tools` wraps `claude plugin`, so the `claude` binary has to be on your `PATH`.

## Install plugins

```bash
npx pace-tools marketplace add        # register the Pace marketplace (one time per machine)
npx pace-tools install sales          # install one plugin
npx pace-tools install engineering data
```

## Find what you need

```bash
npx pace-tools list                   # the whole catalog
npx pace-tools teams                  # per-role starter sets
npx pace-tools teams sales            # one role
npx pace-tools status                 # what is installed
npx pace-tools uninstall sales
npx pace-tools open                   # open pace.tools
```

## Use

Describe the work in your own words and the matching skill takes over, or call it directly:
`/sales:call-prep`, `/data:write-query`, `/engineering:code-review`. The `/pace` router holds the
commands your own company authors.

See [pace.tools/docs](https://pace.tools/docs) for the full catalog and setup guide.

For frontend design work, Pace defers to [impeccable](https://impeccable.style).

## License

Apache 2.0. Scaffold based on [impeccable](https://impeccable.style) by Paul Bakaus.
