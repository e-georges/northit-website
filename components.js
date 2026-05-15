/* North IT — Composants partagés (nav + footer) */

(function() {

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const links = [
    { href: 'index.html',      label: 'Accueil' },
    { href: 'itil-v5.html',    label: 'ITIL® V5' },
    { href: 'formation.html',  label: 'Notre formation' },
    { href: 'references.html', label: 'Références' },
    { href: 'about.html',      label: 'Qui sommes-nous ?' },
    { href: 'blog.html',       label: 'Blog' },
  ];

  const navHTML = `
<nav>
  <div class="nav-inner">
    <a href="index.html" class="nav-logo">North IT</a>
    <ul class="nav-links">
      ${links.map(l => `<li><a href="${l.href}"${currentPage === l.href ? ' class="active"' : ''}>${l.label}</a></li>`).join('')}
      <li><a href="reservation.html" class="nav-cta">Réserver ma place</a></li>
    </ul>
  </div>
</nav>`;

  const footerHTML = `
<footer>
  <div class="foot-inner">
    <div class="foot-grid">
      <div>
        <a href="index.html" class="foot-logo">North IT</a>
        <p class="foot-desc">Organisme de formation et de certification ITIL® basé à Paris. ATO agréé PeopleCert.</p>
        <p class="foot-siret">
          SIRET : 881 897 482 00017 · Déclaration d'activité : 11756378175<br>
          ✉️ <span style="cursor:pointer;color:var(--amber);font-weight:600"
            onclick="var e='e.georges'+'@'+'northit.fr';this.outerHTML='<a href=\\'mailto:'+e+'\\' style=\\'color:var(--amber);text-decoration:none\\'>'+e+'</a>'">
            Cliquer pour afficher l'email
          </span>
        </p>
      </div>
      <div class="foot-col">
        <h4>Formation</h4>
        <a href="formation.html">Certification ITIL® 4 Foundation</a>
        <a href="itil-v5.html">Découvrir ITIL® V5</a>
        <a href="formation.html">Programme complet</a>
        <a href="contact.html">Financement intra</a>
      </div>
      <div class="foot-col">
        <h4>À propos</h4>
        <a href="about.html">Qui sommes-nous ?</a>
        <a href="references.html">Références clients</a>
        <a href="temoignages.html">Témoignages</a>
        <a href="contact.html">Contact</a>
        <a href="termes.html">Termes et conditions</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2025 North IT. Tous droits réservés. ITIL® est une marque déposée d'AXELOS Limited.</span>
      <a href="termes.html">Termes et conditions</a>
    </div>
  </div>
</footer>`;

  document.addEventListener('DOMContentLoaded', function() {
    document.body.insertAdjacentHTML('afterbegin', navHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  });

})();
