---
layout: default
title: Vitæ
permalink: /resume/
---
<!-- ========== RESUME ========== -->

<div class="docs-section" id="resume">
  <h4>Vitæ</h4>
  <!-- The Timeline -->
  <ul class="timeline">
    {% for exp in site.data.experience.experiences %}
    <li>
      {% if exp.category == "work" %}
      <div class="direction-l">
      {% else %}
      <div class="direction-r">
      {% endif %}
        <div class="flag-wrapper">
          <span class="flag">{{ exp.place }}</span>
          <span class="time-wrapper"><span class="time">{{ exp.time }}</span></span>
        </div>
        <div class="desc"><b>{{ exp.title }}</b> <br/> {{ exp.subtitle }}</div>
      </div>
    </li>
    {% endfor %}
  </ul>
</div>
