export const SEARCH_HISTORY_KEY = 'easybazar_search_history'
export const TRENDING_SEARCHES_KEY = 'easybazar_trending_searches'

const PRODUCT_ALIASES = {
  1: ['টমেটো', 'tomato', 'tomatoes'],
  2: ['কলা', 'banana', 'shagor kola'],
  3: ['ব্রকলি', 'broccoli'],
  4: ['আপেল', 'apple', 'apel'],
  5: ['আলু', 'alu', 'potato', 'potatoes'],
  9: ['চাল', 'rice', 'chal', 'miniket'],
  10: ['ডাল', 'মসুর ডাল', 'masoor dal', 'lentil', 'lentils'],
  11: ['দুধ', 'dudh', 'milk'],
  12: ['ডিম', 'dim', 'egg', 'eggs'],
  13: ['মাছ', 'মাছ', 'fish', 'rohu', 'rui', 'rui mach'],
  14: ['মুরগি', 'মুরগী', 'মুরগির মাংস', 'chicken', 'murgi'],
  21: ['পেঁয়াজ', 'পেঁয়াজ', 'পিয়াজ', 'পেঁয়াজ', 'onion', 'onions', 'peyaj'],
  22: ['রসুন', 'garlic', 'roshun'],
  23: ['আদা', 'ginger', 'ada'],
  24: ['কাঁচা মরিচ', 'মরিচ', 'green chili', 'chili', 'morich'],
  25: ['তেল', 'সয়াবিন তেল', 'soybean oil', 'oil', 'tel'],
  26: ['মুগ ডাল', 'moong dal', 'mung bean'],
  27: ['বেগুন', 'brinjal', 'eggplant', 'begun'],
  28: ['ফুলকপি', 'cauliflower', 'fulcopy'],
  29: ['বাঁধাকপি', 'cabbage', 'bandhakopi'],
  30: ['শসা', 'cucumber', 'shosha'],
  31: ['ঢেঁড়স', 'ঢেড়স', 'okra', 'dherosh'],
  32: ['লবণ', 'লবন', 'salt', 'lobon'],
  33: ['চিনি', 'sugar', 'chini'],
  34: ['আটা', 'ময়দা', 'flour', 'atta'],
  35: ['লেবু', 'lemon', 'lebu'],
  36: ['ধনেপাতা', 'ধনিয়া পাতা', 'coriander', 'dhoniya pata'],
  37: ['চা', 'চা পাতা', 'tea', 'cha'],
  38: ['কমলা', 'কমলার জুস', 'orange', 'juice'],
  39: ['সাবান', 'soap'],
  40: ['থালা ধোয়ার তরল', 'dishwashing liquid'],
  41: ['শিশুর ওয়াইপস', 'baby wipes'],
  42: ['পাউরুটি', 'রুটি', 'bread'],
  43: ['কুকিজ', 'বিস্কুট', 'cookies', 'biscuits'],
}

const DEFAULT_TRENDING_SEARCHES = ['Potato', 'Rice', 'Milk', 'Eggs', 'Onion', 'আলু']

export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function getSearchTerms(product) {
  const fields = [
    product.name,
    product.nameBn,
    product.category,
    product.description,
    ...(Array.isArray(product.searchKeywords) ? product.searchKeywords : []),
    ...(PRODUCT_ALIASES[product.id] || []),
  ]
  return fields
    .filter((value) => typeof value === 'string')
    .map(normalizeSearchText)
    .filter(Boolean)
}

function editDistanceWithinOne(first, second) {
  const firstCharacters = [...first]
  const secondCharacters = [...second]
  if (Math.abs(firstCharacters.length - secondCharacters.length) > 1) return false
  let firstIndex = 0
  let secondIndex = 0
  let edits = 0

  while (firstIndex < firstCharacters.length && secondIndex < secondCharacters.length) {
    if (firstCharacters[firstIndex] === secondCharacters[secondIndex]) {
      firstIndex += 1
      secondIndex += 1
      continue
    }
    edits += 1
    if (edits > 1) return false
    if (firstCharacters.length > secondCharacters.length) firstIndex += 1
    else if (secondCharacters.length > firstCharacters.length) secondIndex += 1
    else {
      firstIndex += 1
      secondIndex += 1
    }
  }
  if (firstIndex < firstCharacters.length || secondIndex < secondCharacters.length) edits += 1
  return edits <= 1
}

function tokenMatches(queryToken, termTokens) {
  return termTokens.some((termToken) => {
    if (termToken.includes(queryToken)) return true
    return queryToken.length >= 4 &&
      termToken.length >= 4 &&
      editDistanceWithinOne(queryToken, termToken)
  })
}

export function getProductSearchScore(product, query) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return 0

  const terms = getSearchTerms(product)
  const queryTokens = normalizedQuery.split(' ')
  const tokensMatch = queryTokens.every((queryToken) =>
    terms.some((term) => tokenMatches(queryToken, term.split(' '))),
  )
  if (!tokensMatch) return -1

  if (terms.some((term) => term === normalizedQuery)) return 100
  if (terms.some((term) => term.startsWith(normalizedQuery))) return 80
  if (terms.some((term) => term.includes(normalizedQuery))) return 60
  return 30
}

export function searchProducts(products, query) {
  if (!normalizeSearchText(query)) return products
  return products
    .map((product, index) => ({
      product,
      index,
      score: getProductSearchScore(product, query),
    }))
    .filter((result) => result.score >= 0)
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .map(({ product }) => product)
}

function readStringArray(key, fallback) {
  try {
    const savedValue = localStorage.getItem(key)
    if (!savedValue) return fallback
    const parsed = JSON.parse(savedValue)
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
      : fallback
  } catch (error) {
    console.error(`Unable to load ${key}:`, error)
    return fallback
  }
}

function saveStringArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Unable to save ${key}:`, error)
  }
}

export function loadSearchHistory() {
  return readStringArray(SEARCH_HISTORY_KEY, []).slice(0, 10)
}

export function clearSearchHistory() {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
    window.dispatchEvent(new Event('easybazar-search-history-updated'))
  } catch (error) {
    console.error('Unable to clear search history:', error)
  }
}

export function recordSearch(query) {
  const value = String(query ?? '').trim()
  if (!value) return

  const history = loadSearchHistory().filter(
    (item) => normalizeSearchText(item) !== normalizeSearchText(value),
  )
  saveStringArray(SEARCH_HISTORY_KEY, [value, ...history].slice(0, 10))

  const trending = readStringArray(TRENDING_SEARCHES_KEY, DEFAULT_TRENDING_SEARCHES)
  const updatedTrending = [
    value,
    ...trending.filter((item) => normalizeSearchText(item) !== normalizeSearchText(value)),
  ].slice(0, 8)
  saveStringArray(TRENDING_SEARCHES_KEY, updatedTrending)
  window.dispatchEvent(new Event('easybazar-search-history-updated'))
}

export function loadTrendingSearches() {
  const trending = readStringArray(TRENDING_SEARCHES_KEY, [])
  if (trending.length) return trending.slice(0, 6)
  saveStringArray(TRENDING_SEARCHES_KEY, DEFAULT_TRENDING_SEARCHES)
  return DEFAULT_TRENDING_SEARCHES
}
