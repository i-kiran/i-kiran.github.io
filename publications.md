---
layout: default
title: Publications
permalink: /publications/
---

<div class="docs-section" id="publications">
  <h4>Publications</h4>
  <p>Most recent publications on <a href="{{ site.data.main_info.google_scholar }}" target="_blank">Google Scholar</a>.</p>

  <div class="tab-pane" id="papers-all">
    {% for paper in site.data.publications.papers %}
      <div class="paper">
        <p class="title"><b>{{ paper.title }}</b></p>
        <p>{{ paper.authors }}</p>
        <p><i>{{ paper.venue }}</i></p>
         <div class="paper-buttons">
          {% if paper.paper_pdf %}
            <a class="button" href="{{ paper.paper_pdf | prepend: site.baseurl }}" target="_blank">Paper</a>
          {% endif %}
          {% if paper.slides %}
            <a class="button" href="{{ paper.slides | prepend: site.baseurl }}" target="_blank">Slides</a>
          {% endif %}
          {% if paper.poster %}
            <a class="button" href="{{ paper.poster | prepend: site.baseurl }}" target="_blank">Poster</a>
          {% endif %}
          {% if paper.video %}
            <a class="button" href="{{ paper.video }}" target="_blank">Video</a>
          {% endif %}
          {% if paper.code %}
            <a class="button" href="{{ paper.code }}" target="_blank">Code</a>
          {% endif %}
          {% if paper.data %}
            <a class="button" href="{{ paper.data }}" target="_blank">Data</a>
          {% endif %}
        </div>
      </div>
    {% endfor %}
  </div>
</div>
