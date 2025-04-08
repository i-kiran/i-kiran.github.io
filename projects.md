---
layout: default
title: Projects
permalink: /projects/
---

<div class="docs-section" id="projects">
  <h4>Projects</h4>

  <div class="tab-pane" id="projects-all">
    {% for project in site.data.projects.projects %}
      {% assign index_modulo = forloop.index0 | modulo:3 %}
      {% if index_modulo == 0 %}
        <div class="row">
      {% endif %}

      <div class="four columns">
        <div class="project-container">
          <div class="project-caption">
            <b>{{ project.title }}</b> <br/>
            {{ project.subtitle }}
          </div>
        </div>
      </div>

      {% if index_modulo == 2 %}
        </div>
      {% endif %}
    {% endfor %}
  </div>
</div>
