import { chromium } from "playwright"
import PDFMerger from "pdf-merger-js"
import rmfr from "rmfr"
import axios from "axios"
import fs from "fs/promises"

interface TindieOrder {
  number: number
}

async function fetchAllOrders(shipped: boolean | null = null): Promise<TindieOrder[]> {
  const limit = 50
  const allOrders = [ ]
  let totalOrders = -1
  let offset = 0

  while (totalOrders === -1 || allOrders.length < totalOrders) {
    let url = `https://www.tindie.com/api/v1/order/?format=json&username=${process.env.TINDIE_USERNAME}&api_key=${process.env.TINDIE_KEY}&limit=${limit}&offset=${offset}`
    if (shipped !== null) {
      url += `&shipped=${shipped}`
    }

    const { data: respBody } = await axios.get(url)

    const orders = respBody.orders
    allOrders.push(...orders)

    totalOrders = respBody.meta.total_count
    offset += limit
  }

  return allOrders
}

async function savePdfs(orders: TindieOrder[]) {
  const browser = await chromium.launch()
  const context = await browser.newContext()

  context.addCookies([
    {
      name: "sessionid",
      value: process.env.TINDIE_SESSIONID || "",
      domain: "www.tindie.com",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax"
    }
  ])

  for (const order of orders) {
    const page = await context.newPage()
    await page.goto(`https://www.tindie.com/orders/print/${order.number}/`)
    await page.pdf({
      path: `slips/${order.number}.pdf`,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.1in",
        left: "0.5in"
      },
      scale: 0.9
    })
  }

  await browser.close()
}

async function mergePdfs(orders: TindieOrder[]) {
  const pdfs = orders.map(order => `slips/${order.number}.pdf`)

  let hasBackPage = true
  try {
    fs.access("back.pdf", fs.constants.R_OK)
  } catch(e) {
    hasBackPage = false
  }

  const merger = new PDFMerger()
  for (const pdf of pdfs) {
    await merger.add(pdf)
    if (hasBackPage) await merger.add("back.pdf")
  }

  await merger.save("slips.pdf")
}

async function main() {
  const unshippedOrders = await fetchAllOrders(false)

  await savePdfs(unshippedOrders)
  await mergePdfs(unshippedOrders)
  await rmfr("slips")
}

main()