// ==UserScript==
// @name         Sort Hacker News article list by points
// @namespace    HN
// @version      0.1
// @description  Sorts all HackerNews entries by article points
// @author       jamesrussell1911@gmail.com
// @match        https://news.ycombinator.com/
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  let tbody = document.querySelector('.itemlist tbody');

  // An article is rendered as 3 table rows (class='athing' is the article title, next is the score + metadata,
  // and next is a spacer. (Do these "hackers" know about CSS...?)
  // This code iterates over the rows and groups article rows together, and also records non-article rows.

  let articles = Array();
  let non_article_rows = Array();
  for(let el of tbody.children) {
    if(el.tagName === 'TR') {
      if(el.className === 'athing') {
       articles.push({
         rows: [el],
         points: null,
       });
      } else if(el.className === 'spacer') {
        articles[articles.length-1].rows.push(el);
      } else {
        let score_el = el.querySelector('span.score');
        if(score_el === null) {
          non_article_rows.push(el);
        } else {
          articles[articles.length-1].rows.push(el);
          articles[articles.length-1].points = parseInt(/(\d+) point/.exec(score_el.textContent)[1], 10);
        }
      }
    }
  }

  articles.sort((a, b) => b.points - a.points); // Descending order

  // NB: appendChild will *move* the DOM element to the end of the children, which is why we don't
  // need to explicitly remove it from its current position.
  for(let article of articles) {
    for(let row of article.rows) {
        tbody.appendChild(row);
    }
  }
  // The table had some additional non-article rows that have now bubbled to the top, so pluck them out
  // and move them to the end.
  for(let row of non_article_rows) {
    tbody.appendChild(row);
  }
})();
