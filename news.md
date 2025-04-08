---
layout: default
title: News
permalink: /news/
---

<style>
  .news-container {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    padding: 10px;
    background-color: #f9f9f9;
  }
</style>

<div class="docs-section" id="news">
  <h4>News</h4>
  <div class="news-container">
    {% for nw in site.data.news.news %}
      <div class="row">{{ nw.date }}: {{ nw.title }}</div>
    {% endfor %}
  </div>
</div>
