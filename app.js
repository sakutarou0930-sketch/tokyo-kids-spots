document.addEventListener('DOMContentLoaded', () => {
    let allSpots = [];
    const spotListElement = document.getElementById('spotList');
    const resultCountElement = document.getElementById('resultCount');
    const searchInput = document.getElementById('searchInput');
    const categoryChips = document.querySelectorAll('#categoryFilter .chip');

    let currentFilters = {
        search: '',
        category: 'all'
    };

    // データの取得
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allSpots = data;
            renderSpots(allSpots);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            spotListElement.innerHTML = '<div class="loading">データの読み込みに失敗しました。</div>';
        });

    // フィルタリング処理
    function filterSpots() {
        const filtered = allSpots.filter(spot => {
            // 検索キーワードの判定 (名前または駅名、住所)
            const searchMatch = currentFilters.search === '' || 
                spot.name.includes(currentFilters.search) || 
                spot.station.includes(currentFilters.search) ||
                spot.address.includes(currentFilters.search);

            // カテゴリの判定
            const categoryMatch = currentFilters.category === 'all' || spot.category === currentFilters.category;

            return searchMatch && categoryMatch;
        });

        renderSpots(filtered);
    }

    // 表示処理
    function renderSpots(spots) {
        spotListElement.innerHTML = '';
        resultCountElement.textContent = spots.length;

        if (spots.length === 0) {
            spotListElement.innerHTML = '<div class="loading">条件に一致するスポットが見つかりません💦</div>';
            return;
        }

        const template = document.getElementById('spotCardTemplate');

        spots.forEach(spot => {
            const clone = template.content.cloneNode(true);
            
            // 画像とバッジの設定
            clone.querySelector('.card-image').src = spot.image;
            clone.querySelector('.card-image').alt = spot.name;
            clone.querySelector('.category-badge').textContent = spot.category;
            
            // 料金バッジ
            const priceBadge = clone.querySelector('.price-badge');
            priceBadge.textContent = spot.price;
            if (spot.price === '無料') {
                priceBadge.classList.add('price-free');
            } else {
                priceBadge.classList.add('price-paid');
            }

            // テキスト情報の設定
            clone.querySelector('.card-title').textContent = spot.name;
            clone.querySelector('.card-description').textContent = spot.description;
            clone.querySelector('.card-address').textContent = spot.address;
            clone.querySelector('.card-station').textContent = spot.station;
            clone.querySelector('.card-hours').textContent = spot.hours;
            clone.querySelector('.card-phone').textContent = spot.phone;

            // 特徴タグの表示制御（おむつ台・授乳室）
            if (spot.diaper_table) {
                clone.querySelector('.diaper-tag').classList.add('active');
            }
            if (spot.nursing_room) {
                clone.querySelector('.nursing-tag').classList.add('active');
            }

            // リンクボタンの生成
            const linksContainer = clone.querySelector('.card-links');
            if (spot.links && spot.links.length > 0) {
                spot.links.forEach(link => {
                    const a = document.createElement('a');
                    a.href = link.url;
                    a.textContent = link.title;
                    a.className = 'card-link-btn';
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    linksContainer.appendChild(a);
                });
            } else {
                linksContainer.style.display = 'none';
            }

            spotListElement.appendChild(clone);
        });
    }

    // 検索入力のイベント
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        filterSpots();
    });

    // カテゴリフィルターのイベント
    function setupChipFilters(chips, filterKey) {
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentFilters[filterKey] = chip.dataset.value;
                filterSpots();
            });
        });
    }

    setupChipFilters(categoryChips, 'category');
});
