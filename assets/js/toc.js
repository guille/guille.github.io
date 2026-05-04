(function () {
  var toc = document.querySelector('.toc');
  if (!toc) return;

  var tocPath = toc.querySelector('.toc-marker path');
  var tocItems;

  var TOP_MARGIN = 0.1;
  var BOTTOM_MARGIN = 0.2;

  var pathLength;
  var lastPathStart;
  var lastPathEnd;

  window.addEventListener('resize', drawPath, false);
  window.addEventListener('scroll', sync, false);

  drawPath();

  function drawPath() {
    tocItems = [].slice.call(toc.querySelectorAll('li'));

    tocItems = tocItems.map(function (item) {
      var anchor = item.querySelector('a');
      if (!anchor) return null;
      var href = anchor.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return null;
      var target = document.getElementById(href.slice(1));
      return {
        listItem: item,
        anchor: anchor,
        target: target
      };
    }).filter(function (item) {
      return item && item.target;
    });

    // Compute the "end" of each section (= start of next section or end of article)
    var article = document.querySelector('.post-content') || document.querySelector('article');
    tocItems.forEach(function (item, i) {
      if (i < tocItems.length - 1) {
        item.sectionEnd = tocItems[i + 1].target;
      } else {
        item.sectionEnd = null; // last section extends to end of content
      }
    });

    var path = [];
    var pathIndent;

    tocItems.forEach(function (item, i) {
      var x = item.anchor.offsetLeft - 5;
      var y = item.anchor.offsetTop;
      var height = item.anchor.offsetHeight;

      if (i === 0) {
        path.push('M', x, y, 'L', x, y + height);
        item.pathStart = 0;
      } else {
        if (pathIndent !== x) path.push('L', pathIndent, y);
        path.push('L', x, y);
        tocPath.setAttribute('d', path.join(' '));
        item.pathStart = tocPath.getTotalLength() || 0;
        path.push('L', x, y + height);
      }

      pathIndent = x;
      tocPath.setAttribute('d', path.join(' '));
      item.pathEnd = tocPath.getTotalLength();
    });

    pathLength = tocPath.getTotalLength();
    sync();
  }

  function sync() {
    var windowHeight = window.innerHeight;
    var pathStart = pathLength;
    var pathEnd = 0;
    var visibleItems = 0;

    tocItems.forEach(function (item) {
      // Section spans from its heading to the next heading (or end of page)
      var sectionTop = item.target.getBoundingClientRect().top;
      var sectionBottom;

      if (item.sectionEnd) {
        sectionBottom = item.sectionEnd.getBoundingClientRect().top;
      } else {
        // Last section: extends to end of article or a large value
        var article = document.querySelector('.post-content') || document.querySelector('article');
        sectionBottom = article ? article.getBoundingClientRect().bottom : windowHeight * 2;
      }

      // Section is visible if any part of it is in the viewport
      if (sectionBottom > windowHeight * TOP_MARGIN && sectionTop < windowHeight * (1 - BOTTOM_MARGIN)) {
        pathStart = Math.min(item.pathStart, pathStart);
        pathEnd = Math.max(item.pathEnd, pathEnd);
        visibleItems += 1;
        item.listItem.classList.add('visible');
      } else {
        item.listItem.classList.remove('visible');
      }
    });

    if (visibleItems > 0 && pathStart < pathEnd) {
      if (pathStart !== lastPathStart || pathEnd !== lastPathEnd) {
        tocPath.setAttribute('stroke-dashoffset', '1');
        tocPath.setAttribute('stroke-dasharray', '1, ' + pathStart + ', ' + (pathEnd - pathStart) + ', ' + pathLength);
        tocPath.setAttribute('opacity', 1);
      }
    } else {
      tocPath.setAttribute('opacity', 0);
    }

    lastPathStart = pathStart;
    lastPathEnd = pathEnd;
  }
})();
