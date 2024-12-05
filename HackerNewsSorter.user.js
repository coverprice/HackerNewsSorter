// ==UserScript==
// @name         Sort Hacker News article list by points
// @namespace    HN
// @version      0.3
// @description  Sorts all HackerNews entries by article points
// @author       jamesrussell1911@gmail.com
// @match        https://news.ycombinator.com/
// @match        https://news.ycombinator.com/news?p=*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  sortArticlesByPoints();

  function sortArticlesByPoints() {
    let tbody = findArticleTbody();
    let table_rows = findArticles(tbody);
    sortArticles(table_rows.articles);
    reinjectArticlesIntoDOM(tbody, table_rows.articles);
    reinjectNonArticlesIntoDOM(tbody, table_rows.non_article_rows);
  }

  function findArticleTbody() {
    return document.querySelector('#pagespace').nextElementSibling.querySelector("table tbody");
  }

  function findArticles(tbody) {
    // An article is rendered as 3 table rows (class='athing' is the article title, next is the score + metadata,
    // and next is a spacer. (Do these "hackers" know about CSS...?)
    // This code iterates over the rows and groups article rows together, and also records non-article rows.
    let result = {
      non_article_rows: Array(),
      articles: Array(),
    };
    for(let el of tbody.children) {
      if(el.tagName === 'TR') {
        if(el.classList.contains('athing')) {
           result.articles.push([el]);
        } else if(el.classList.contains('spacer')) {
          result.articles[result.articles.length-1].push(el);
        } else {
          if(el.textContent.includes(" ago")) {
            result.articles[result.articles.length-1].push(el);
          } else {
            result.non_article_rows.push(el);
          }
        }
      }
    }
    return result;
  }

  function sortArticles(articles) {
     // Each article is an array with 3 rows. The 2nd row contains the points.
     articles.sort((a, b) => getPoints(b) - getPoints(a)); // Descending order

     function getPoints(article) {
        let score_el = article[1].querySelector('span.score');
        return score_el ? parseInt(/(\d+) point/.exec(score_el.textContent)[1], 10) : -1000;
     }
  }

  function reinjectArticlesIntoDOM(tbody, articles) {
    // NB: appendChild will *move* the DOM element to the end of the children, which is why we don't
    // need to explicitly remove it from its current position.
    for(let article of articles) {
      for(let row of article) {
        tbody.appendChild(row);
      }
    }
  }

  // The table had some additional non-article rows that have now bubbled to the top, so pluck them out
  // and move them to the end.
  function reinjectNonArticlesIntoDOM(tbody, non_article_rows) {
    for(let row of non_article_rows) {
      tbody.appendChild(row);
    }
  }
})();
