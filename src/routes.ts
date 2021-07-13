import { Router } from 'express'
import { Readable } from 'stream'
import readline from 'readline'

import multer from 'multer'
import { client } from './database/client'

const multerConfig = multer()

const router = Router()

interface Product {
  code_bar: string;
  description: string;
  price: number;
  quantity: number;
}

router.post('/products', multerConfig.single("file"), async (request, response) => {
  const { file } = request
  const { buffer } = file as Express.Multer.File

  const newReadable = new Readable()
  newReadable.push(buffer)
  newReadable.push(null)

  const productsLine = readline.createInterface({
    input: newReadable
  })

  const products: Product[] = []

  for await (let line of productsLine) {
    const productLineSplit = line.split(',')

    products.push({
      code_bar: productLineSplit[0],
      description: productLineSplit[1],
      price: Number(productLineSplit[2]),
      quantity: Number(productLineSplit[3]),
    })
  }

  for await (let product of products) {
    await client.products.create({
      data: product
    })
  }


  return response.json(products)
})

export { router }
