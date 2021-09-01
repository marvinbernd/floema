require('dotenv').config()

const express = require('express')
const errorHandler = require('errorhandler')
const logger = require('morgan')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const path = require('path')

const app = express()
const port = 3000

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  })
}

const handleLinkResolver = (doc) => {
  // Define the url depending on the document type
  if (doc.type === 'product') return `/detail/${doc.slug}`

  if (doc.type === 'collections') return `/collections`

  if (doc.type === 'about') return `/about`

  // Default to homepage
  return '/'
}

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride())
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))

// Middleware to inject prismic context
app.use((req, res, next) => {
  /* res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver
  } */
  res.locals.Link = handleLinkResolver

  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM

  const numbers = [
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten'
  ]

  res.locals.Numbers = (index) => numbers[index]

  next()
})

app.set('view engine', 'pug')

const handleRequest = async (api) => {
  const meta = await api.getSingle('meta')
  const navigation = await api.getSingle('navigation')
  const preloader = await api.getSingle('preloader')

  return {
    meta,
    navigation,
    preloader
  }
}

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')

  const { results: collections } = await api.query(
    Prismic.Predicates.at('document.type', 'collection')
  )

  res.render('pages/home', {
    ...defaults,
    collections,
    home
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const about = await api.getSingle('about')

  res.render('pages/about', {
    ...defaults,
    about
  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')

  const { results: collections } = await api.query(
    Prismic.Predicates.at('document.type', 'collection'),
    {
      fetchLinks: 'product.image'
    }
  )

  res.render('pages/collections', {
    ...defaults,
    collections,
    home
  })
})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  })

  console.log(product)

  res.render('pages/detail', {
    ...defaults,
    product
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
