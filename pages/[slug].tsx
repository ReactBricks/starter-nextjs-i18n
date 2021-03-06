import { useContext } from 'react'
import {
  ReactBricksContext,
  PageViewer,
  fetchPage,
  fetchPages,
  cleanPage,
  types,
} from 'react-bricks'
import Head from 'next/head'
import { GetStaticProps, GetStaticPaths } from 'next'

import config from '../react-bricks/config'
import Layout from '../components/Layout'

interface PageProps {
  page: types.Page
}

const Page: React.FC<PageProps> = ({ page }) => {
  // Clean the received content
  // Removes unknown or not allowed bricks
  const { pageTypes, bricks } = useContext(ReactBricksContext)
  const pageOk = cleanPage(page, pageTypes, bricks)

  return (
    <Layout>
      <Head>
        <title>{page.meta.title}</title>
        <meta name="description" content={page.meta.description} />
      </Head>
      <PageViewer page={pageOk} />
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  if (!config.apiKey) {
    return { props: { error: 'NOKEYS' } }
  }
  const { slug } = context.params
  const page = await fetchPage(slug.toString(), config.apiKey, context.locale)
  return { props: { page } }
}

export const getStaticPaths: GetStaticPaths = async () => {
  if (!config.apiKey) {
    return { paths: [], fallback: false }
  }

  const allPages = await fetchPages(config.apiKey)

  const paths = allPages
    .map((page) =>
      page.translations.map((translation) => ({
        params: { slug: page.slug },
        locale: translation,
      }))
    )
    .flat()

  return { paths, fallback: false }
}

export default Page
