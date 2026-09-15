const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const { protect, authorize } = require('../middleware/auth');

// ─── 1. PUBLIC: GET ALL PAGES LIST ───
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find({})
      .select('slug title subtitle isPublished updatedAt createdAt lastUpdatedBy')
      .sort({ createdAt: 1 });
    res.json({ success: true, pages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── 2. PUBLIC: GET SINGLE PAGE BY SLUG ───
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const page = await Page.findOne({ slug });

    if (!page) {
      return res.status(404).json({ success: false, message: 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি।' });
    }

    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── 3. ADMIN: CREATE NEW PAGE ───
router.post('/', protect, authorize('Super Admin', 'Admin'), async (req, res) => {
  try {
    const { title, slug, subtitle, content, seoTitle, seoDescription, isPublished } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ success: false, message: 'শিরোনাম এবং স্লাগ আবশ্যক।' });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
    const existing = await Page.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'এই স্লাগ দিয়ে ইতোমধ্যেই একটি পেজ রয়েছে।' });
    }

    const newPage = await Page.create({
      title,
      slug: cleanSlug,
      subtitle: subtitle || '',
      content: content || '',
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || subtitle || '',
      isPublished: isPublished !== false,
      lastUpdatedBy: req.user ? req.user.name : 'Admin'
    });

    res.status(201).json({ success: true, page: newPage, message: 'নতুন পেজ সফলভাবে তৈরি হয়েছে।' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── 4. ADMIN: UPDATE PAGE ───
router.put('/:slug', protect, authorize('Super Admin', 'Admin'), async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const { title, subtitle, content, seoTitle, seoDescription, isPublished } = req.body;

    let page = await Page.findOne({ slug });
    if (!page) {
      // Allow upserting if not found
      page = new Page({ slug });
    }

    if (title !== undefined) page.title = title;
    if (subtitle !== undefined) page.subtitle = subtitle;
    if (content !== undefined) page.content = content;
    if (seoTitle !== undefined) page.seoTitle = seoTitle;
    if (seoDescription !== undefined) page.seoDescription = seoDescription;
    if (isPublished !== undefined) page.isPublished = isPublished;
    page.lastUpdatedBy = req.user ? req.user.name : 'Admin';

    await page.save();
    res.json({ success: true, page, message: 'পেজের তথ্য সফলভাবে আপডেট হয়েছে।' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── 5. ADMIN: DELETE PAGE (Super Admin only) ───
router.delete('/:slug', protect, authorize('Super Admin'), async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const result = await Page.findOneAndDelete({ slug });
    if (!result) {
      return res.status(404).json({ success: false, message: 'পেজটি পাওয়া যায়নি।' });
    }
    res.json({ success: true, message: 'পেজটি সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
