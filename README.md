# Tindie Packing Slip Generator

This is a tool that lets you generate a PDF which contains all your unshipped Tindie orders' packing slips with an optional back side.

## Usage

Install dependencies: `pnpm install`

Set environment variables:

- `TINDIE_USERNAME`: Your Tindie username
- `TINDIE_KEY`: Your Tindie API key, can be found [here](https://www.tindie.com/stores/extras/)
- `TINDIE_SESSIONID`: The `sessionid` cookie from your logged-in browser session (needed to access the packing slip pages)

Then run `pnpm start` to generate the PDF. Note that it will only include orders that have not been shipped yet.

You can also optionally add a back side to the packing slips by adding a `back.pdf` file adjacent the script. The resulting PDF will alternate between packing slip and the back page, so you can print it two-sided and it will have the packing slip on the front, and your custom page on the back.