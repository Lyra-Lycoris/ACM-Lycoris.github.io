# Auxiliary Services

This directory contains service source code that supports the blog but is not
part of the Hugo or GitHub Pages build.

## Waline

`waline/` is the retained Waline comment backend source. The live blog uses the
CloudBase endpoint configured in `config/_default/params.yml`; moving this source
directory does not change that deployed endpoint.
