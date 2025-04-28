import { fetchJSON, renderProjects } from '../global.js';

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
let searchInput = document.querySelector('.searchBar');
const titleElement = document.querySelector('.projects-title');

renderProjects(projects, projectsContainer, 'h2');
if (titleElement) {
  titleElement.textContent = `${projects.length} Projects`;
}

let selectedYear = null;
let query = '';

function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year }; // TODO
  });
  // re-calculate slice generator, arc data, arc, etc.
  let selectedIndex = -1;
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  // TODO: clear up paths and legends
  let svg = d3.select('svg');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove(); 
  // update paths and legends, refer to steps 1.4 and 2.2
  newArcs.forEach((arc, idx) => {
    const yearValue = newData[idx].label;
    const isSelected = yearValue === selectedYear;
    // TODO, fill in step for appending path to svg using D3
    svg.append('path').attr('d', arc).attr('fill', colors(idx)).on('click', () => {
      if (selectedIndex === idx) {
        // Deselect if clicking the same segment
        selectedIndex = -1;
        selectedYear = null;
      } else {
        // Select new segment
        selectedIndex = idx;
        selectedYear = newData[idx].label;
      }
      
      svg.selectAll('path').attr('class', (_, i) => {
        if (selectedIndex === -1) {
          return null; 
        } else {
          return i === selectedIndex ? 'selected' : 'notSelected';
        }
      });

      // Update legend to reflect selection
      legend.selectAll('li').attr('class', (_, i) => i === selectedIndex ? 'selected legendList' : 'legendList');

      let filteredProjects = projects;
        
      // Apply search filter first
      if (query) {
        filteredProjects = filteredProjects.filter((project) => {
          let values = Object.values(project).join('\n').toLowerCase();
          return values.includes(query.toLowerCase());
        });
      }

      if (selectedYear !== null) {
        filteredProjects = filteredProjects.filter(p => p.year === selectedYear);
      }

      renderProjects(filteredProjects, projectsContainer, 'h2');
    });
  });

  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
      .attr('class', 'legendList')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  });
}

renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase()
    return values.includes(query.toLowerCase())
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});
