const header = document.querySelector('#site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

const setMenu = (open) => {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  document.body.classList.toggle('menu-open', open);
};

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
}

if (header) {
  window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 40), { passive: true });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const homeStoryList = document.querySelector('#home-story-list');
if (homeStoryList) {
  const formatStoryDate = (value) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value || '';
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  const storyHref = (post) => {
    if (!post.url) return `story/post.html?id=${encodeURIComponent(post.id || '')}`;
    const url = String(post.url);
    return /^https?:\/\//i.test(url) ? url : `story/${url.replace(/^\.\//, '')}`;
  };

  fetch('story/posts.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then((posts) => {
      const latest = (Array.isArray(posts) ? posts : [])
        .slice()
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
        .slice(0, 3);
      homeStoryList.textContent = '';
      if (!latest.length) {
        const empty = document.createElement('p');
        empty.className = 'story-error';
        empty.textContent = '첫 번째 이야기를 준비하고 있습니다.';
        homeStoryList.appendChild(empty);
        return;
      }
      latest.forEach((post) => {
        const card = document.createElement('a');
        card.className = 'home-story-card';
        card.href = storyHref(post);
        const time = document.createElement('time');
        time.dateTime = String(post.date || '');
        time.textContent = formatStoryDate(post.date);
        const title = document.createElement('h3');
        title.textContent = String(post.title || '(제목 없음)');
        const summary = document.createElement('p');
        summary.textContent = String(post.summary || '빈스톡스의 새로운 이야기를 만나보세요.');
        const arrow = document.createElement('span');
        arrow.className = 'story-arrow';
        arrow.textContent = 'READ STORY  →';
        card.append(time, title, summary, arrow);
        homeStoryList.appendChild(card);
      });
    })
    .catch(() => {
      homeStoryList.textContent = '';
      const error = document.createElement('p');
      error.className = 'story-error';
      error.textContent = '이야기를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.';
      homeStoryList.appendChild(error);
    });
}
