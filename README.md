# Badge Generator for Github Actions

Simple action to generate a coverage badge from an OpenCover XML file. Ensure you get the case of the paths correct for the agent running the job.

## Example usage

```yaml
on:
  pull_request:
    types: [opened]
    branches:
      - master
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - name: OpenCover Badge Generator
        uses: danpetitt/open-cover-badge-generator-action@0.0.2
        with:
          path-to-opencover-xml: test/opencover.xml
          path-to-badge: coverage-badge.svg
          minimum-coverage: 75
```
