/** Shopify Storefront API — GetProducts query */
export const PRODUCTS_QUERY = /* GraphQL */ `
  query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        handle
        title
        description
        descriptionHtml
        productType
        tags
        availableForSale
        createdAt
        featuredImage {
          url
          altText
        }
        images(first: 6) {
          nodes {
            url
            altText
          }
        }
        options {
          id
          name
          values
        }
        variants(first: 30) {
          nodes {
            id
            title
            sku
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;
