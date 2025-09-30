(function () {
  const ready = (fn) => {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  };

  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  ready(() => {
    const results = document.getElementById('search-results');
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-term');
    const indexElement = document.getElementById('search-index');

    if (!results || !form || !input || !indexElement) {
      return;
    }

    let pages = [];
    try {
      const raw = indexElement.textContent || indexElement.innerText || '[]';
      pages = JSON.parse(raw);
    } catch (error) {
      console.warn('[minimo] Failed to parse search index', error);
    }

    const params = new URLSearchParams(window.location.search);
    const emptyText = results.dataset.resultsEmpty || '';
    const searchingText = results.dataset.searching || '';
    let query = (params.get('q') || '').trim();

    if (query) {
      input.value = query;
    }

    const render = (items, pending = false) => {
      results.innerHTML = '';

      if (pending) {
        const placeholder = document.createElement('li');
        placeholder.className = 'loading';
        placeholder.textContent = searchingText;
        results.appendChild(placeholder);
        return;
      }

      if (!items.length) {
        const placeholder = document.createElement('li');
        placeholder.className = 'empty';
        placeholder.textContent = emptyText;
        results.appendChild(placeholder);
        return;
      }

      const markQuery = (text, keyword) => {
        if (!keyword) {
          return text;
        }

        try {
          const reg = new RegExp(escapeRegExp(keyword), 'gi');
          return text.replace(reg, (match) => `<mark>${match}</mark>`);
        } catch (error) {
          console.warn('[minimo] Failed to highlight search term', error);
          return text;
        }
      };

      items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'item';

        const article = document.createElement('article');
        article.className = 'list-entry';

        const header = document.createElement('header');
        header.className = 'item-header';

        const title = document.createElement('h3');
        title.className = 'item-title';

        const link = document.createElement('a');
        link.href = item.permalink;
        link.innerHTML = markQuery(item.title, query);
        title.appendChild(link);
        header.appendChild(title);

        if (item.date) {
          const meta = document.createElement('div');
          meta.className = 'meta';
          meta.textContent = item.date;
          article.appendChild(meta);
        }

        article.appendChild(header);

        if (item.summary) {
          const summary = document.createElement('p');
          summary.className = 'item-summary';
          summary.innerHTML = markQuery(item.summary, query);
          article.appendChild(summary);
        }

        li.appendChild(article);
        results.appendChild(li);
      });
    };

    const performSearch = (keyword) => {
      const normalized = keyword.trim().toLowerCase();

      if (!normalized) {
        results.innerHTML = '';
        return;
      }

      render([], true);

      window.requestAnimationFrame(() => {
        const filtered = pages
          .filter((item) => {
            const haystack = `${item.title} ${item.summary || ''}`.toLowerCase();
            return haystack.includes(normalized);
          })
          .slice(0, 20);

        render(filtered);
      });
    };

    const updateUrl = (value) => {
      if (!window.history || !window.history.replaceState) {
        return;
      }

      const next = new URL(window.location.href);
      if (value) {
        next.searchParams.set('q', value);
      } else {
        next.searchParams.delete('q');
      }

      window.history.replaceState({}, '', next.toString());
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      query = input.value.trim();
      updateUrl(query);
      performSearch(query);
    });

    input.addEventListener('input', (event) => {
      query = event.target.value;
      updateUrl(query.trim());
      if (!query.trim()) {
        results.innerHTML = '';
        return;
      }
      performSearch(query);
    });

    if (query) {
      performSearch(query);
    }
  });
})();
