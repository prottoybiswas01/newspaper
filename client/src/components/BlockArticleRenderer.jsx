import React from 'react';
import DOMPurify from 'dompurify';
import AdPlacement from './AdPlacement';
import { 
  Quote, Image as ImageIcon, Video, Music, 
  HelpCircle, CheckCircle, Clock, AlertTriangle, 
  Layers, ExternalLink 
} from 'lucide-react';

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const BlockArticleRenderer = ({ 
  blocks = [], 
  legacyContent = '', 
  fontSize = 17, 
  category = '', 
  articleId = '',
  adSettings = { autoPlacement: true, maxAds: 3 } 
}) => {

  // 1. If no blocks are present, render legacy HTML content with automatic ad injection
  if (!blocks || blocks.length === 0) {
    if (!legacyContent) return null;

    const sanitizedHtml = DOMPurify.sanitize(legacyContent);
    // Split HTML by paragraphs to inject in-article ads cleanly
    const paragraphs = sanitizedHtml.split(/<\/p>/i).filter(p => p.trim().length > 0);

    // If short legacy article, render single block
    if (paragraphs.length <= 2) {
      return (
        <div 
          className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-gray-900 dark:text-neutral-100 font-sans"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    }

    // Inject in-article ad between paragraphs
    const adPositions = [
      Math.min(2, Math.floor(paragraphs.length * 0.35)),
      Math.min(6, Math.floor(paragraphs.length * 0.70))
    ];

    return (
      <div 
        className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-gray-900 dark:text-neutral-100 font-sans space-y-4"
        style={{ fontSize: `${fontSize}px` }}
      >
        {paragraphs.map((p, idx) => {
          const isSlot1 = idx === adPositions[0];
          const isSlot2 = idx === adPositions[1] && paragraphs.length > 5;

          return (
            <React.Fragment key={idx}>
              <div dangerouslySetInnerHTML={{ __html: p + '</p>' }} />
              {isSlot1 && adSettings.autoPlacement !== false && (
                <div className="my-6 not-prose">
                  <AdPlacement placement="article-inline-1" category={category} articleId={articleId} />
                </div>
              )}
              {isSlot2 && adSettings.autoPlacement !== false && (
                <div className="my-6 not-prose">
                  <AdPlacement placement="article-inline-2" category={category} articleId={articleId} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // 2. Structured Block Rendering System
  const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));
  const totalBlocks = sortedBlocks.length;

  // Determine automatic ad placement indices based on article length heuristics
  // Short (< 5 blocks): 0-1 ad (after block 2)
  // Medium (5-9 blocks): 1-2 ads (after block 3, block 6)
  // Long (>= 10 blocks): 2-3 ads (after block 3, block 7, block 11)
  const autoAdSlotIndices = new Set();
  const hasManualAds = sortedBlocks.some(b => b.type === 'ad');

  if (adSettings.autoPlacement !== false && !hasManualAds) {
    if (totalBlocks >= 3 && totalBlocks < 6) {
      autoAdSlotIndices.add(2); // after 3rd block
    } else if (totalBlocks >= 6 && totalBlocks < 10) {
      autoAdSlotIndices.add(2);
      autoAdSlotIndices.add(5);
    } else if (totalBlocks >= 10) {
      autoAdSlotIndices.add(2);
      autoAdSlotIndices.add(6);
      if (adSettings.maxAds >= 3) autoAdSlotIndices.add(9);
    }
  }

  let autoAdCounter = 1;

  return (
    <div className="article-block-stream space-y-6" style={{ fontSize: `${fontSize}px` }}>
      {sortedBlocks.map((block, index) => {
        let blockContent = null;

        switch (block.type) {
          case 'heading': {
            const level = block.metadata?.level || 2;
            const headingClasses = "font-black text-gray-950 dark:text-white tracking-tight mt-8 mb-4";
            if (level === 2) {
              blockContent = <h2 className={`text-xl sm:text-2xl ${headingClasses}`}>{block.content}</h2>;
            } else if (level === 3) {
              blockContent = <h3 className={`text-lg sm:text-xl ${headingClasses}`}>{block.content}</h3>;
            } else {
              blockContent = <h4 className={`text-base sm:text-lg ${headingClasses}`}>{block.content}</h4>;
            }
            break;
          }

          case 'paragraph': {
            blockContent = (
              <div 
                className="leading-loose text-gray-900 dark:text-neutral-100 font-sans"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content || '') }}
              />
            );
            break;
          }

          case 'image': {
            const imgUrl = block.content || block.metadata?.url;
            const caption = block.metadata?.caption || '';
            const credit = block.metadata?.credit || '';
            blockContent = (
              <figure className="my-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#121212] shadow-xs">
                {imgUrl && (
                  <img 
                    src={imgUrl} 
                    alt={caption || 'সংবাদ ছবি'} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto max-h-[550px] object-cover"
                  />
                )}
                {(caption || credit) && (
                  <figcaption className="p-3 text-xs text-gray-600 dark:text-neutral-400 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs border-t border-gray-100 dark:border-neutral-800">
                    <span className="font-medium">{caption}</span>
                    {credit && <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">{credit}</span>}
                  </figcaption>
                )}
              </figure>
            );
            break;
          }

          case 'gallery': {
            const images = block.metadata?.images || [];
            blockContent = (
              <div className="my-8">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  <Layers className="h-4 w-4" />
                  <span>ফটো গ্যালারি</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900">
                      <img 
                        src={img.url || img} 
                        alt={img.caption || `ছবি ${i+1}`} 
                        loading="lazy"
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-[11px] font-medium truncate">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
            break;
          }

          case 'quote': {
            blockContent = (
              <blockquote className="my-6 p-5 rounded-2xl bg-red-50/70 dark:bg-red-950/20 border-l-4 border-red-600 dark:border-red-500 shadow-xs relative">
                <Quote className="h-6 w-6 text-red-400 dark:text-red-600 mb-2 opacity-50" />
                <p className="text-base sm:text-lg font-bold text-gray-950 dark:text-white leading-relaxed italic">
                  "{block.content}"
                </p>
                {(block.metadata?.author || block.metadata?.designation) && (
                  <cite className="block mt-3 text-xs font-semibold text-gray-600 dark:text-neutral-400 not-italic">
                    — {block.metadata?.author} {block.metadata?.designation ? `(${block.metadata?.designation})` : ''}
                  </cite>
                )}
              </blockquote>
            );
            break;
          }

          case 'video': {
            const ytId = getYouTubeId(block.content);
            blockContent = (
              <div className="my-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 shadow-md">
                {ytId ? (
                  <div className="relative aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="ভিডিও প্লেয়ার"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                ) : (
                  <video src={block.content} controls className="w-full h-auto" />
                )}
                {block.metadata?.caption && (
                  <p className="p-3 bg-gray-50 dark:bg-neutral-900 text-xs text-gray-600 dark:text-neutral-400 font-medium">
                    {block.metadata.caption}
                  </p>
                )}
              </div>
            );
            break;
          }

          case 'audio': {
            blockContent = (
              <div className="my-6 p-4 rounded-2xl bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
                  <Music className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                    {block.metadata?.title || 'অডিও রেকর্ড / পডকাস্ট'}
                  </h5>
                  <audio src={block.content} controls className="w-full h-9" />
                </div>
              </div>
            );
            break;
          }

          case 'factbox':
          case 'callout': {
            blockContent = (
              <div className="my-6 p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 shadow-xs">
                <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>{block.metadata?.title || 'গুরুত্বপূর্ণ তথ্য / ফ্যাক্ট বক্স'}</span>
                </div>
                <div 
                  className="text-sm sm:text-base text-gray-900 dark:text-neutral-200 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content || '') }}
                />
              </div>
            );
            break;
          }

          case 'timeline': {
            const events = block.metadata?.events || [];
            blockContent = (
              <div className="my-6 p-5 rounded-2xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-neutral-800">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span>{block.metadata?.title || 'ঘটনাপঞ্জি ও টাইমলাইন'}</span>
                </div>
                <div className="space-y-4 border-l-2 border-red-500 ml-2 pl-4">
                  {events.length > 0 ? events.map((ev, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-red-600 border-2 border-white dark:border-neutral-900" />
                      <span className="text-[11px] font-extrabold text-red-600 dark:text-red-400 block">{ev.time}</span>
                      <h6 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{ev.title}</h6>
                      {ev.description && <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1">{ev.description}</p>}
                    </div>
                  )) : (
                    <p className="text-xs text-gray-500 italic">{block.content}</p>
                  )}
                </div>
              </div>
            );
            break;
          }

          case 'table': {
            blockContent = (
              <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-neutral-800">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none p-2"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content || '') }}
                />
              </div>
            );
            break;
          }

          case 'divider': {
            blockContent = <hr className="my-8 border-gray-200 dark:border-neutral-800" />;
            break;
          }

          case 'ad': {
            const placementSlot = block.metadata?.placement || `article-inline-${autoAdCounter++}`;
            blockContent = (
              <div className="my-6 not-prose">
                <AdPlacement placement={placementSlot} category={category} articleId={articleId} />
              </div>
            );
            break;
          }

          default:
            blockContent = (
              <div 
                className="leading-loose text-gray-900 dark:text-neutral-100"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content || '') }}
              />
            );
            break;
        }

        const shouldInjectAutoAd = autoAdSlotIndices.has(index);
        const autoSlotName = `article-inline-${autoAdCounter}`;

        return (
          <React.Fragment key={block.id || index}>
            {blockContent}
            {shouldInjectAutoAd && (
              <div className="my-6 not-prose">
                <AdPlacement placement={autoSlotName} category={category} articleId={articleId} />
                {(() => { autoAdCounter++; return null; })()}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BlockArticleRenderer;
