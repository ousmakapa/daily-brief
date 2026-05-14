import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';

// Show notifications even when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── Topics config ────────────────────────────────────────────────────────────

const TOPICS = {
  ai: {
    label: 'AI',
    emoji: '🤖',
    color: '#7c5cfc',
    gradient: ['#2d1f6e', '#0d0d18'],
    feeds: [
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://www.artificialintelligence-news.com/feed/',
      'https://the-decoder.com/feed/',
      'https://openai.com/news/rss.xml',
      'https://blog.google/technology/ai/rss/',
      'https://www.microsoft.com/en-us/ai/blog/feed/',
      'https://aws.amazon.com/blogs/machine-learning/feed/',
      'https://blogs.nvidia.com/feed/',
      'https://news.google.com/rss/search?q=OpenAI+OR+Anthropic+OR+Gemini+OR+AI+model&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize the top AI and machine learning news today in 3-4 engaging sentences. Focus on the most impactful developments.',
  },
  nba: {
    label: 'NBA',
    emoji: '🏀',
    color: '#e85d26',
    gradient: ['#5a2010', '#0d0d18'],
    feeds: [
      'https://www.espn.com/espn/rss/nba/news',
      'https://sports.yahoo.com/nba/rss.xml',
      'https://www.cbssports.com/rss/headlines/nba/',
      'https://news.google.com/rss/search?q=NBA+trades+playoffs+injury+contract&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=NBA+news+ESPN+Yahoo+CBS+The+Athletic+playoffs&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize the top NBA news and highlights today in 3-4 engaging sentences. Include key games, trades, or player news.',
  },
  padel: {
    label: 'Padel',
    emoji: '🎾',
    color: '#22c55e',
    gradient: ['#0f3a20', '#0d0d18'],
    feeds: [
      'https://padelmagazine.fr/feed/',
      'https://www.padelalto.com/feed/',
      'https://thepadelpaper.com/feed/',
      'https://www.padeladdict.com/feed/',
      'https://news.google.com/rss/search?q=Premier+Padel+tournament+ranking+players&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize the top padel news today in 3-4 engaging sentences. Include tournament results, player news, or industry updates.',
  },
  shoes: {
    label: 'Sneakers',
    emoji: '👟',
    color: '#f59e0b',
    gradient: ['#4a3000', '#0d0d18'],
    feeds: [
      'https://sneakernews.com/feed/',
      'https://www.nicekicks.com/feed/',
      'https://www.kicksonfire.com/feed/',
      'https://www.runnersworld.com/rss/all.xml/',
      'https://news.google.com/rss/search?q=Nike+Adidas+Jordan+New+Balance+sneaker+drop+collab&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=running+shoe+release+On+Asics+Hoka+sneaker&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize the top sneaker news today in 3-4 sentences. Cover Nike, Adidas, Jordan, and major drops or collabs.',
  },
  biz: {
    label: 'Business',
    emoji: '💼',
    color: '#3b82f6',
    gradient: ['#0d2b5e', '#0d0d18'],
    feeds: [
      { url: 'https://news.google.com/rss/search?q=sales+strategy+lead+generation+closing+customer+retention+-stock+-stocks&hl=en-US&gl=US&ceid=US:en', angle: 'Sales' },
      { url: 'https://blog.hubspot.com/sales/rss.xml', angle: 'Sales' },
      { url: 'https://www.salesforce.com/blog/category/sales/feed/', angle: 'Sales' },
      { url: 'https://news.google.com/rss/search?q=ecommerce+Shopify+DTC+marketplaces+conversion+checkout+-stock+-stocks&hl=en-US&gl=US&ceid=US:en', angle: 'Ecommerce' },
      { url: 'https://www.retaildive.com/feeds/news/', angle: 'Ecommerce' },
      { url: 'https://www.modernretail.co/feed/', angle: 'Ecommerce' },
      { url: 'https://www.practicalecommerce.com/feed', angle: 'Ecommerce' },
      { url: 'https://www.ecommercebytes.com/feed', angle: 'Ecommerce' },
      { url: 'https://news.google.com/rss/search?q=branding+brand+strategy+positioning+customer+trust+business+-stock+-stocks&hl=en-US&gl=US&ceid=US:en', angle: 'Branding' },
      { url: 'https://www.brandingmag.com/feed/', angle: 'Branding' },
      { url: 'https://www.fastcompany.com/latest/rss', angle: 'Branding' },
      { url: 'https://www.socialmediatoday.com/feeds/news/', angle: 'Content Marketing' },
      { url: 'https://buffer.com/resources/rss/', angle: 'Content Marketing' },
      { url: 'https://www.socialmediaexaminer.com/feed/', angle: 'Content Marketing' },
      { url: 'https://blog.hubspot.com/marketing/rss.xml', angle: 'Content Marketing' },
      { url: 'https://copyblogger.com/feed/', angle: 'Content Marketing' },
      { url: 'https://news.google.com/rss/search?q=content+marketing+short+form+video+UGC+creator+strategy+business&hl=en-US&gl=US&ceid=US:en', angle: 'Content Marketing' },
      { url: 'https://the-decoder.com/feed/', angle: 'AI Tools' },
      { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', angle: 'AI Tools' },
      { url: 'https://blog.google/technology/ai/rss/', angle: 'AI Tools' },
      { url: 'https://news.google.com/rss/search?q=AI+tools+automation+small+business+marketing+sales+operations&hl=en-US&gl=US&ceid=US:en', angle: 'AI Tools' },
      { url: 'https://news.google.com/rss/search?q=consumer+trends+shopping+behavior+wellness+fitness+retail+Gen+Z&hl=en-US&gl=US&ceid=US:en', angle: 'Consumer Trends' },
      { url: 'https://www.glossy.co/feed/', angle: 'Consumer Trends' },
      { url: 'https://www.retaildive.com/feeds/news/', angle: 'Consumer Trends' },
      { url: 'https://smallbiztrends.com/feed/', angle: 'Operations' },
      { url: 'https://www.entrepreneur.com/latest.rss', angle: 'Operations' },
      { url: 'https://feeds.feedburner.com/entrepreneur/latest', angle: 'Operations' },
      { url: 'https://news.google.com/rss/search?q=business+operations+hiring+SOP+customer+support+inventory+cash+flow+-stock+-stocks&hl=en-US&gl=US&ceid=US:en', angle: 'Operations' },
      { url: 'https://news.google.com/rss/search?q=creator+economy+influencer+marketing+affiliate+UGC+social+commerce&hl=en-US&gl=US&ceid=US:en', angle: 'Creator Economy' },
      { url: 'https://www.creatoriq.com/blog/rss.xml', angle: 'Creator Economy' },
      { url: 'https://www.socialmediaexaminer.com/feed/', angle: 'Creator Economy' },
      { url: 'https://www.influencermarketinghub.com/feed/', angle: 'Creator Economy' },
    ],
    excludeTerms: ['stock market', 'stocks', 'nasdaq', 's&p', 'dow jones', 'share price', 'trading day', 'wall street'],
    prompt:
      'Summarize practical business growth news for a business owner. Cover sales, ecommerce, branding, content marketing, AI tools, consumer trends, operations, and the creator economy. Avoid stock-market updates unless they directly affect business operations.',
  },
  viral: {
    label: 'Viral',
    emoji: '🔥',
    color: '#ec4899',
    gradient: ['#4a0a2e', '#0d0d18'],
    feeds: [
      'https://www.socialmediatoday.com/feeds/news/',
      'https://www.adweek.com/feed/',
      'https://www.marketingdive.com/feeds/news/',
      'https://www.socialmediaexaminer.com/feed/',
      'https://www.creatoriq.com/blog/rss.xml',
      'https://www.influencermarketinghub.com/feed/',
      'https://news.google.com/rss/search?q=viral+video+TikTok+Instagram+YouTube+brand+campaign&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=viral+marketing+idea+creator+trend+short+video&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize viral videos, viral ideas, creator trends, and standout marketing campaigns from today. Explain what made them spread and what a marketer or business owner can learn.',
  },
  dent: {
    label: 'Dentistry',
    emoji: '🦷',
    color: '#06b6d4',
    gradient: ['#043a42', '#0d0d18'],
    feeds: [
      'https://www.dentistrytoday.com/feed/',
      'https://www.dental-tribune.com/feed/',
      'https://news.google.com/rss/search?q=dentistry+dental+2025&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=oral+health+teeth+gum+disease&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=dental+implant+orthodontics+braces&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=dental+technology+AI+dentistry&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=dental+research+treatment+study&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize the top dentistry and oral health news today. Cover new treatments, research, technology, or industry updates.',
  },
  arch: {
    label: 'Architecture',
    emoji: '🏛️',
    color: '#a78bfa',
    gradient: ['#2e1f5e', '#0d0d18'],
    feeds: [
      'https://feeds.feedburner.com/dezeen',
      'https://www.archdaily.com/search/projects/rss',
      'https://www.archdaily.com/search/news/rss',
      'https://www.designboom.com/architecture/feed/',
      'https://www.architecturaldigest.com/feed/rss',
      'https://www.archpaper.com/feed/',
      'https://www.architecturelab.net/feed/',
      'https://news.google.com/rss/search?q=architecture+design+2025&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=building+design+construction+2025&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=urban+planning+city+design+sustainable&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=architecture+award+prize+Pritzker&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize the top architecture and design news today. Cover notable buildings, urban projects, design trends, or awards.',
  },
  med: {
    label: 'Medicine',
    emoji: '⚕️',
    color: '#14b8a6',
    gradient: ['#063b36', '#0d0d18'],
    feeds: [
      'https://www.healthline.com/rss/health-news',
      'https://www.news-medical.net/syndication.axd?format=rss',
      'https://www.medpagetoday.com/rss/headlines.xml',
      'https://www.fiercehealthcare.com/rss/xml',
      'https://www.healthcareitnews.com/feed',
      'https://www.medicaldesignandoutsourcing.com/feed/',
      'https://www.sciencedaily.com/rss/health_medicine.xml',
      'https://news.google.com/rss/search?q=medical+research+treatment+clinical+trial+healthcare&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize the top medicine and healthcare news today. Cover clinical research, treatments, public health, useful health guidance, and healthcare industry updates.',
  },
  supp: {
    label: 'Supplements',
    emoji: '💪',
    color: '#84cc16',
    gradient: ['#2f3f05', '#0d0d18'],
    feeds: [
      'https://www.news-medical.net/syndication.axd?format=rss',
      'https://www.healthline.com/rss/health-news',
      'https://www.naturalproductsinsider.com/rss.xml',
      'https://www.nutraceuticalbusinessreview.com/rss',
      'https://www.supplysidesj.com/rss.xml',
      'https://news.google.com/rss/search?q=protein+powder+creatine+supplements+nutrition+study&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=sports+nutrition+whey+protein+creatine+pre-workout+supplements&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=supplement+industry+vitamins+amino+acids+fitness+nutrition&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize useful supplement news and research today, especially protein, creatine, pre-workout, vitamins, sports nutrition, safety, product trends, and credible studies. Keep claims cautious and evidence-based.',
  },
  perf: {
    label: 'Performance Marketing',
    emoji: '📈',
    color: '#f97316',
    gradient: ['#4b2207', '#0d0d18'],
    feeds: [
      'https://www.searchenginejournal.com/category/paid-media/feed/',
      'https://www.ppchero.com/feed/',
      'https://www.searchenginejournal.com/feed/',
      'https://www.marketingdive.com/feeds/news/',
      'https://www.adexchanger.com/feed/',
      'https://martech.org/feed/',
      'https://neilpatel.com/feed/',
      'https://www.seroundtable.com/index.rdf',
      'https://searchengineland.com/feed',
      'https://ads-developers.googleblog.com/feeds/posts/default?alt=rss',
      'https://developers.facebook.com/blog/feed/',
      'https://www.thinkwithgoogle.com/rss.xml',
      'https://news.google.com/rss/search?q=performance+marketing+paid+ads+Meta+Google+TikTok+ROAS+CAC&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=Meta+Ads+Manager+Facebook+Instagram+ads+Advantage%2B+campaigns&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=Google+Ads+Performance+Max+YouTube+ads+paid+search+updates&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=TikTok+ads+Shop+ads+paid+social+creative+testing&hl=en-US&gl=US&ceid=US:en',
    ],
    prompt:
      'Summarize performance marketing news for operators. Focus on paid social, Google Ads, TikTok ads, creative testing, attribution, ROAS, CAC, ecommerce funnels, and platform changes.',
  },
  higgs: {
    label: 'Higgsfield',
    emoji: '🎬',
    color: '#38bdf8',
    gradient: ['#08364d', '#0d0d18'],
    feeds: [
      'https://news.google.com/rss/search?q=Higgsfield+AI+video&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=Higgsfield+Soul+Try+On+AI&hl=en-US&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=Higgsfield+AI+camera+controls+video+creator&hl=en-US&gl=US&ceid=US:en',
      'https://the-decoder.com/feed/',
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://blog.google/technology/ai/rss/',
    ],
    prompt:
      'Summarize news about Higgsfield and adjacent AI video tools. Focus on product launches, creator use cases, viral AI video ideas, model updates, and competitive moves.',
  },
};

const TOPIC_KEYS = Object.keys(TOPICS);
const RSS_API = 'https://api.rss2json.com/v1/api.json?rss_url=';
const CACHE_TTL = 6 * 60 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

function parseArticleTitleAndSource(title, fallbackSource) {
  if (/google news/i.test(fallbackSource || '') && title.includes(' - ')) {
    const parts = title.split(' - ');
    const source = parts.pop().trim();
    return { title: parts.join(' - ').trim() || title, source: source || fallbackSource };
  }
  return { title, source: fallbackSource };
}

const STOP_WORDS = new Set([
  'about','after','again','against','also','amid','and','are','as','at','be','because','been','being','but','by',
  'can','could','day','days','for','from','has','have','how','in','into','is','it','its','latest','may','more',
  'new','news','not','of','on','over','say','says','than','that','the','their','this','to','today','up','via',
  'was','what','when','where','who','why','will','with','you','your'
]);

function articleTokens(text) {
  return new Set(String(text || '')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9+\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w)));
}

function setSimilarity(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  a.forEach((v) => {
    if (b.has(v)) shared += 1;
  });
  return shared / Math.min(a.size, b.size);
}

const ENTITY_TOKENS = new Set([
  'adidas','advantage+','amazon','anthropic','apple','chatgpt','claude','creatine','deepmind','facebook','gemini',
  'google','higgsfield','instagram','jordan','meta','microsoft','nba','nike','openai','padel','shopify','tiktok',
  'youtube'
]);

function hasStrongEntityOverlap(a, b, titleScore) {
  const first = articleTokens(`${a.title} ${a.description}`);
  const second = articleTokens(`${b.title} ${b.description}`);
  const shared = [...first].filter((token) => second.has(token));
  const sharedEntities = shared.filter((token) => ENTITY_TOKENS.has(token));
  return sharedEntities.length >= 2 || shared.some((token) => token.includes('+'));
}

function relatedScore(a, b) {
  const titleScore = setSimilarity(articleTokens(a.title), articleTokens(b.title));
  if (titleScore >= 0.72) return titleScore;
  if (hasStrongEntityOverlap(a, b, titleScore)) return 0.62;
  const textScore = setSimilarity(
    articleTokens(`${a.title} ${a.description}`),
    articleTokens(`${b.title} ${b.description}`)
  );
  return titleScore * 0.7 + textScore * 0.3;
}

function articleQualityScore(article) {
  const source = String(article.source || '').toLowerCase();
  const link = String(article.link || '').toLowerCase();
  const descLength = Math.min((article.description || '').length, 900);
  const titleLength = Math.min((article.title || '').length, 160);
  const isGoogle = source.includes('google news') || link.includes('news.google.');
  const hasDescription = descLength > 80 ? 1 : 0;
  const dateScore = Number.isFinite(Date.parse(article.date))
    ? Math.max(0, 1 - (Date.now() - new Date(article.date)) / 86400000)
    : 0;
  return (isGoogle ? 0 : 140) + descLength + titleLength * 0.35 + hasDescription * 80 + dateScore * 70;
}

function articleDateMs(article) {
  const ms = Date.parse(article?.date || '');
  return Number.isFinite(ms) ? ms : 0;
}

function chooseBestRelatedArticles(articles) {
  const groups = [];
  articles
    .filter((a) => a && a.title)
    .sort((a, b) => articleQualityScore(b) - articleQualityScore(a))
    .forEach((article) => {
      let match = null;
      let bestScore = 0;
      groups.forEach((group) => {
        const score = Math.max(...group.items.map((item) => relatedScore(article, item)));
        if (score > bestScore) {
          bestScore = score;
          match = group;
        }
      });
      if (match && bestScore >= 0.58) {
        match.items.push(article);
        if (articleQualityScore(article) > articleQualityScore(match.best)) match.best = article;
      } else {
        groups.push({ best: article, items: [article] });
      }
    });

  return groups
    .map((group) => ({
      ...group.best,
      relatedCount: group.items.length,
      relatedSources: [...new Set(group.items.map((a) => a.source).filter(Boolean))],
    }))
    .sort((a, b) => articleDateMs(b) - articleDateMs(a));
}

export default function App() {
  const [activeTab, setActiveTab] = useState('ai');
  const [data, setData] = useState({});
  const [loadingSet, setLoadingSet] = useState(new Set(TOPIC_KEYS));
  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [keyError, setKeyError] = useState('');

  useEffect(() => {
    init();
    scheduleNotification();
  }, []);

  // ─── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    try {
      const [raw, key] = await Promise.all([
        AsyncStorage.getItem('cache_v2'),
        AsyncStorage.getItem('openai_key'),
      ]);

      const apiKey = key || '';
      if (apiKey) {
        setSavedKey(apiKey);
        setApiKeyInput(apiKey);
      }

      const cache = raw ? JSON.parse(raw) : {};
      setData(cache);

      const now = Date.now();
      const stale = TOPIC_KEYS.filter(
        (t) => !cache[t] || now - cache[t].ts > CACHE_TTL
      );

      await Promise.all(stale.map((t) => fetchTopic(t, cache, apiKey)));
      setLoadingSet(new Set());
    } catch (e) {
      console.error('Init error:', e);
      setLoadingSet(new Set());
    }
  }

  // ─── Notification ──────────────────────────────────────────────────────────

  async function scheduleNotification() {
    if (!Device.isDevice) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📰 Daily Brief',
        body: "Today's Daily Brief sections are ready!",
      },
      trigger: {
        hour: 12,
        minute: 0,
        repeats: true,
      },
    });
  }

  // ─── Fetching ──────────────────────────────────────────────────────────────

  async function fetchTopic(topicKey, currentData = data, apiKey = savedKey) {
    const topic = TOPICS[topicKey];
    try {
      const results = await Promise.allSettled(
        topic.feeds.map((feedConfig) => {
          const feed = typeof feedConfig === 'string' ? { url: feedConfig } : feedConfig;
          return fetch(`${RSS_API}${encodeURIComponent(feed.url)}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.status !== 'ok') return [];
              const feedTitle = d.feed?.title || new URL(feed.url).hostname.replace('www.', '');
              return d.items.map((item) => {
                const parsed = parseArticleTitleAndSource(stripHtml(item.title || ''), feedTitle);
                return {
                  id: item.guid || item.link,
                  title: parsed.title,
                  description: stripHtml(
                    item.description || item.content || ''
                  ).slice(0, 600),
                  link: item.link || '',
                  source: parsed.source,
                  date: item.pubDate,
                  angle: feed.angle || '',
                };
              });
            });
        })
      );

      const articles = chooseBestRelatedArticles(results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value)
        .filter((a) => {
          if (!a.title) return false;
          const haystack = `${a.title} ${a.description}`.toLowerCase();
          if (topic.excludeTerms?.some((term) => haystack.includes(term.toLowerCase()))) {
            return false;
          }
          return true;
        }));

      const summary =
        apiKey && articles.length
          ? await generateSummary(topic, articles, apiKey)
          : null;

      const updated = {
        ...currentData,
        [topicKey]: { articles, summary, ts: Date.now() },
      };

      setData({ ...updated });
      setLoadingSet((prev) => {
        const s = new Set(prev);
        s.delete(topicKey);
        return s;
      });

      await AsyncStorage.setItem('cache_v2', JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn(`Fetch failed for ${topicKey}:`, e.message);
      setLoadingSet((prev) => {
        const s = new Set(prev);
        s.delete(topicKey);
        return s;
      });
      return currentData;
    }
  }

  // ─── OpenAI ────────────────────────────────────────────────────────────────

  async function generateSummary(topic, articles, apiKey) {
    const headlines = articles
      .slice(0, 6)
      .map((a, i) => `${i + 1}. ${a.title}`)
      .join('\n');
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 200,
          messages: [
            {
              role: 'system',
              content:
                'You are a sharp, concise news briefer. Write in an engaging clear style with no bullet points.',
            },
            {
              role: 'user',
              content: `${topic.prompt}\n\nHeadlines:\n${headlines}`,
            },
          ],
        }),
      });
      if (!resp.ok) return null;
      const json = await resp.json();
      return json.choices?.[0]?.message?.content?.trim() || null;
    } catch {
      return null;
    }
  }

  // ─── Pull to refresh ───────────────────────────────────────────────────────

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const cleared = { ...data };
    delete cleared[activeTab];
    setLoadingSet(new Set([activeTab]));
    await fetchTopic(activeTab, cleared);
    setRefreshing(false);
  }, [activeTab, data]);

  // ─── Settings ──────────────────────────────────────────────────────────────

  async function saveSettings() {
    const key = apiKeyInput.trim();
    if (key && !key.startsWith('sk-')) {
      setKeyError('Key should start with sk-...');
      return;
    }
    setKeyError('');
    if (key) await AsyncStorage.setItem('openai_key', key);
    else await AsyncStorage.removeItem('openai_key');
    setSavedKey(key);
    setSettingsVisible(false);

    // Regenerate all summaries
    const cleared = {};
    setData(cleared);
    setLoadingSet(new Set(TOPIC_KEYS));
    let current = cleared;
    for (const t of TOPIC_KEYS) {
      current = await fetchTopic(t, current, key);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const topic = TOPICS[activeTab];
  const topicData = data[activeTab];
  const isLoading = loadingSet.has(activeTab);
  const articles = topicData?.articles || [];
  const summary = topicData?.summary;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={s.safe}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Daily Brief</Text>
            <Text style={s.headerDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => setSettingsVisible(true)}
          >
            <Text style={s.iconBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.tabsRow}
          contentContainerStyle={s.tabsContent}
        >
          {TOPIC_KEYS.map((key) => {
            const t = TOPICS[key];
            const active = key === activeTab;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  s.tab,
                  active && { backgroundColor: t.color, borderColor: t.color },
                ]}
                onPress={() => setActiveTab(key)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabLabel, active && s.tabLabelActive]}>
                  {t.emoji} {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Feed ── */}
        <FlatList
          data={isLoading ? [] : articles}
          keyExtractor={(item, i) => item.id || String(i)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={topic.color}
            />
          }
          ListHeaderComponent={
            <>
              {/* Summary card */}
              <LinearGradient
                colors={topic.gradient}
                style={s.summaryCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[s.summaryBadge, { color: topic.color }]}>
                  ✦  TODAY'S BRIEF
                </Text>
                {isLoading ? (
                  <View style={s.summaryLoader}>
                    <ActivityIndicator color={topic.color} size="small" />
                    <Text style={s.summaryLoaderText}>Loading summary…</Text>
                  </View>
                ) : summary ? (
                  <Text style={s.summaryText}>{summary}</Text>
                ) : (
                  <Text style={s.summaryEmpty}>
                    {savedKey
                      ? 'Pull down to refresh.'
                      : 'Tap ⚙️ and add your OpenAI key to get AI summaries.'}
                  </Text>
                )}
              </LinearGradient>

              {/* Section label */}
              {!isLoading && (
                <Text style={s.sectionLabel}>
                  {topic.emoji}  {topic.label} News
                </Text>
              )}

              {/* Skeletons */}
              {isLoading &&
                [0, 1, 2, 3].map((i) => (
                  <View key={i} style={s.skeleton}>
                    <View style={s.skLine1} />
                    <View style={s.skLine2} />
                    <View style={[s.skLine2, { width: '60%' }]} />
                  </View>
                ))}
            </>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => item.link && Linking.openURL(item.link)}
              activeOpacity={0.72}
            >
              <Text style={[s.cardSource, { color: topic.color }]}>
                {item.source}
              </Text>
              <Text style={s.cardTitle}>{item.title}</Text>
              {!!item.description && (
                <Text style={s.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <Text style={s.cardDate}>{timeAgo(item.date)}</Text>
              {!!item.angle && (
                <Text style={[s.cardAngle, { color: topic.color, borderColor: topic.color }]}>
                  {item.angle}
                </Text>
              )}
              {item.relatedCount > 1 && (
                <Text style={s.cardRelated}>
                  Best source from {item.relatedCount} related articles
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>📭</Text>
                <Text style={s.emptyText}>
                  No articles found.{'\n'}Pull down to refresh.
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={s.listPad}
        />
      </SafeAreaView>

      {/* ── Settings modal ── */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Settings ⚙️</Text>

          <Text style={s.inputLabel}>OpenAI API Key</Text>
          <TextInput
            style={s.input}
            value={apiKeyInput}
            onChangeText={(v) => {
              setApiKeyInput(v);
              setKeyError('');
            }}
            placeholder="sk-..."
            placeholderTextColor="#444"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
          {!!keyError && <Text style={s.keyError}>{keyError}</Text>}
          <Text style={s.inputNote}>
            Get a free key at platform.openai.com — your key stays on your
            device only.
          </Text>

          <TouchableOpacity style={s.saveBtn} onPress={saveSettings}>
            <Text style={s.saveBtnText}>Save & Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => setSettingsVisible(false)}
          >
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <View style={s.notifBox}>
            <Text style={s.notifTitle}>📬  Daily 12 PM Notification</Text>
            <Text style={s.notifDesc}>
              A notification is automatically scheduled every day at noon. Tap
              it to open your fresh brief.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BG = '#0a0a0f';
const SURFACE = '#13131a';
const BORDER = '#1e1e2e';
const TEXT = '#f0f0f8';
const TEXT2 = '#666688';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
    letterSpacing: -0.4,
  },
  headerDate: { fontSize: 12, color: TEXT2, marginTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18 },

  // Tabs
  tabsRow: { maxHeight: 56 },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    marginRight: 8,
  },
  tabLabel: { fontSize: 14, fontWeight: '600', color: TEXT2 },
  tabLabelActive: { color: '#000' },

  // Summary
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 6,
    borderRadius: 18,
    padding: 20,
  },
  summaryBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.9)',
  },
  summaryEmpty: { fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 22 },
  summaryLoader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryLoaderText: { fontSize: 14, color: 'rgba(255,255,255,0.45)' },

  // Section
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT2,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },

  // Article card
  card: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  cardSource: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    lineHeight: 22,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: TEXT2,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDate: { fontSize: 11, color: '#33334a' },
  cardAngle: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    overflow: 'hidden',
  },
  cardRelated: {
    marginTop: 7,
    fontSize: 11,
    color: TEXT2,
    fontWeight: '600',
  },

  // Skeleton
  skeleton: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  skLine1: {
    height: 16,
    width: '85%',
    backgroundColor: '#1c1c2e',
    borderRadius: 8,
    marginBottom: 10,
  },
  skLine2: {
    height: 13,
    width: '100%',
    backgroundColor: '#181828',
    borderRadius: 6,
    marginBottom: 6,
  },

  // Empty
  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 42, marginBottom: 14 },
  emptyText: {
    fontSize: 15,
    color: TEXT2,
    textAlign: 'center',
    lineHeight: 22,
  },

  listPad: { paddingHorizontal: 16, paddingBottom: 40 },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: SURFACE,
    padding: 24,
    paddingTop: 16,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: BORDER,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    color: TEXT,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 6,
  },
  keyError: { fontSize: 12, color: '#f87171', marginBottom: 6 },
  inputNote: {
    fontSize: 12,
    color: '#444466',
    lineHeight: 18,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: '#7c5cfc',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: TEXT2 },
  notifBox: {
    marginTop: 32,
    padding: 16,
    backgroundColor: BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 8,
  },
  notifDesc: { fontSize: 13, color: TEXT2, lineHeight: 20 },
});
