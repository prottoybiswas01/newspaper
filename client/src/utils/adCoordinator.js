import { api } from './api';

/**
 * AdCoordinator
 * Global client-side coordinator that guarantees:
 * 1. ZERO duplicate ads on any single page view (articles, categories, homepage).
 * 2. Automatic reset of displayed ads on page navigation.
 * 3. Smooth sequential resolution of ad requests to avoid race conditions when multiple slots mount at once.
 */
class AdCoordinator {
  constructor() {
    this.renderedAdIds = new Set();
    this.lastPath = typeof window !== 'undefined' ? window.location.pathname : '';
    this.requestQueue = Promise.resolve();
    this.cacheBySlot = new Map();

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => this.checkRouteChange());
    }
  }

  checkRouteChange() {
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname;
    if (currentPath !== this.lastPath) {
      this.lastPath = currentPath;
      this.resetPageAds();
    }
  }

  resetPageAds() {
    this.renderedAdIds.clear();
    this.cacheBySlot.clear();
  }

  /**
   * Request an ad for a specific placement slot.
   * Uses a queue so slots mounting simultaneously pass updated excludeIds.
   */
  async requestAd({ slotId, placement, category = '', articleId = '' }) {
    this.checkRouteChange();

    // Check if slot was already assigned an ad on this page
    if (slotId && this.cacheBySlot.has(slotId)) {
      return this.cacheBySlot.get(slotId);
    }

    // Queue request to prevent race conditions across simultaneous mounting slots
    return new Promise((resolve) => {
      this.requestQueue = this.requestQueue.then(async () => {
        try {
          const device = typeof window !== 'undefined'
            ? (window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop'))
            : 'Desktop';

          const excludeParam = this.renderedAdIds.size > 0
            ? `&excludeIds=${Array.from(this.renderedAdIds).join(',')}`
            : '';
          const catParam = category ? `&category=${encodeURIComponent(category)}` : '';
          const artParam = articleId ? `&articleId=${encodeURIComponent(articleId)}` : '';

          const res = await api.get(
            `/ads/serve?placement=${encodeURIComponent(placement)}${catParam}${artParam}&device=${device}${excludeParam}`
          );

          if (res && res.success && res.ad) {
            const ad = res.ad;
            if (ad._id) {
              this.renderedAdIds.add(String(ad._id));
            }
            if (slotId) {
              this.cacheBySlot.set(slotId, ad);
            }
            resolve(ad);
          } else {
            resolve(null);
          }
        } catch (err) {
          console.error(`[AdCoordinator] Error fetching ad for ${placement}:`, err);
          resolve(null);
        }
      });
    });
  }

  recordImpression(adId) {
    if (!adId || adId.startsWith('house_default_')) return;
    api.post(`/ads/${adId}/impression`).catch(() => null);
  }

  recordClick(adId) {
    if (!adId || adId.startsWith('house_default_')) return;
    api.post(`/ads/${adId}/click`).catch(() => null);
  }
}

export const adCoordinator = new AdCoordinator();
export default adCoordinator;
