
    const input = document.getElementById('searchInput');
    const suggestions = document.getElementById('suggestions');
    const resultBox = document.getElementById('resultBox');

    let allPackages = [];

    fetch('https://formulae.brew.sh/api/formula.json')
      .then(res => res.json())
      .then(data => {
        allPackages = data.map(pkg => pkg.name);
      });

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      resultBox.innerHTML = '';
      suggestions.innerHTML = '';

      if (query.length < 2) return;

      const matches = allPackages.filter(name => name.startsWith(query)).slice(0, 10);

      matches.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        li.addEventListener('click', () => {
          input.value = name;
          suggestions.innerHTML = '';
          searchPackage(name);
        });
        suggestions.appendChild(li);
      });

      if (matches.length === 1 && matches[0] === query) {
        searchPackage(matches[0]);
        suggestions.innerHTML = '';
      }
    });

    async function searchPackage(name) {
      const url = `https://formulae.brew.sh/api/formula/${name}.json`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Nicht gefunden");

        const data = await res.json();
        const cmd = `brew install ${data.name}`;

        resultBox.innerHTML = `
          <h2>${data.name}</h2>
          <p>${data.desc}</p>
          <p><strong>Version:</strong> ${data.versions.stable}</p>
          <p><strong>Kommando:</strong> 
            <code id="installCmd">${cmd}</code>
            <button onclick="copyToClipboard('${cmd}')">📋 Kopieren</button>
          </p>
          <p><strong>Lizenz:</strong> ${data.license}</p>
          <p><strong>Abhängigkeiten:</strong> ${data.dependencies.join(', ') || 'Keine'}</p>
          <p><a href="${data.homepage}" target="_blank">🔗 Homepage</a></p>
          <div id="copyMessage" class="copied" style="display:none;">✅ Kopiert!</div>
        `;
      } catch (err) {
        resultBox.innerHTML = `<p>❌ Paket nicht gefunden.</p>`;
      }
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        const msg = document.getElementById('copyMessage');
        msg.style.display = 'block';
        setTimeout(() => msg.style.display = 'none', 2000);
      });
    }
