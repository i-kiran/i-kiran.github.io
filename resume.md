---
layout: default
title: Vitæ
permalink: /resume/
---
<!-- ========== RESUME ========== -->

<div class="docs-section" id="resume">
  <h4>Vitæ</h4>

  <div class="resume-highlight">
    <p>
      You can view or download my latest CV here:
      <a href="{{ '/assets/files/Kirandeep_Kaur_CV.pdf' | relative_url }}" target="_blank">
        <b>Kirandeep Kaur — Curriculum Vitae</b>
      </a>
    </p>
  </div>

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
