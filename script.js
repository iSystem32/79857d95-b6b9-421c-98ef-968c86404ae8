// Make functions globally accessible for HTML onclick attributes
let switchPage, openTab, copyToClipboard, hideOverlay, payBill;

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');

    const userData = {
        name: 'HAROLD ALONSO HERNANDEZ',
        accountNumber: '14025659937',
        clabe: '014540140256599373',
        rfc: 'AOHH9803252Q5',
        address: 'LAUREL, 69, CHULAVISTA, CUERNAVACA, 62029, CUERNAVACA, MORELOS',
        branch: {
            name: '5247 SC DOM 10 CNVCA',
            address: 'AV DOMINGO DIEZ NO 1604 COL MARAVILLAS, 62230, CUERNAVACA, MOR., MORELOS',
        },
        balance: 150000.00,
        accountOpeningDate: '15/11/2025',
        pendingBills: [
            {
                id: 'megacable-1',
                service: 'Megacable - Internet',
                subscriberNumber: '4740022536',
                package: 'Doble Pack Internet 100 Megas + Telefonía Fija',
                dueDate: '06 de enero',
                amount: 480.00
            }
        ],
        transactions: []
    };

    // --- Global Functions ---

    switchPage = (pageId) => {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        } else {
            console.error(`Page with id "${pageId}" not found.`);
        }

        // Update active state on nav buttons
        updateNavActiveState(pageId);
    };

    openTab = (evt, tabName) => {
        // Hide all tab content
        const tabcontent = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Deactivate all tab links
        const tablinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the selected tab content and activate the tab link
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    };

    copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copiado al portapapeles');
        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    };

    // --- Overlay Management ---
    const successOverlay = document.getElementById('success-overlay');

    function showOverlay() {
        successOverlay.classList.remove('hidden');
    }

    hideOverlay = () => {
        successOverlay.classList.add('hidden');
        switchPage('home'); // Go back home after confirming
    };

    // --- Initial Setup ---

    function init() {
        // Populate Account Details
        const detailsTab = document.getElementById('details');
        detailsTab.innerHTML = `
            <div class="detail-item">
                <strong>Fecha de Apertura:</strong>
                <span>${userData.accountOpeningDate}</span>
            </div>
            <div class="detail-item">
                <strong>Número de Cuenta:</strong>
                <span>${userData.accountNumber} <button class="copy-btn" onclick="copyToClipboard('${userData.accountNumber}')"><i class="fas fa-copy"></i></button></span>
            </div>
            <div class="detail-item">
                <strong>CLABE:</strong>
                <span>${userData.clabe} <button class="copy-btn" onclick="copyToClipboard('${userData.clabe}')"><i class="fas fa-copy"></i></button></span>
            </div>
            <div class="detail-item">
                <strong>RFC:</strong>
                <span>${userData.rfc}</span>
            </div>
            <div class="detail-item">
                <strong>Dirección:</strong>
                <span>${userData.address}</span>
            </div>
            <div class="detail-item">
                <strong>Sucursal:</strong>
                <span>${userData.branch.name}</span>
            </div>
             <div class="detail-item">
                <a href="https://www.google.com/maps?q=${encodeURIComponent(userData.branch.address)}" target="_blank" class="map-link">Ver en mapa</a>
            </div>
        `;

        // Balance Toggle Logic
        const toggleBtn = document.getElementById('toggle-balance');
        const balanceEl = document.getElementById('balance-amount');
        let balanceVisible = true;

        toggleBtn.addEventListener('click', () => {
            if (balanceVisible) {
                balanceEl.textContent = '******';
                toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                balanceEl.textContent = `$${userData.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            }
            balanceVisible = !balanceVisible;
        });

        // Set initial page
        switchPage('home');

        // Render dynamic content
        renderPendingBills();
        createPaymentConfirmationPages();
        renderTransactions();

        // --- Event Listeners for Quick Actions ---

        // Transfer Form Logic
        const transferForm = document.getElementById('transfer-form');
        transferForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const destAccount = document.getElementById('dest-account').value;
            const transferAmount = document.getElementById('transfer-amount').value;

            if (destAccount && transferAmount) {
                // In a real app, you'd process the transfer here
                console.log(`Transfering ${transferAmount} to ${destAccount}`);
                showOverlay();
                transferForm.reset(); // Clear the form
            } else {
                alert('Por favor, completa todos los campos.');
            }
        });

        // Withdrawal Code Generation
        const generateCodeBtn = document.getElementById('generate-code-btn');
        const withdrawalCodeDiv = document.getElementById('withdrawal-code');
        generateCodeBtn.addEventListener('click', () => {
            const code = Math.floor(10000000 + Math.random() * 90000000).toString();
            withdrawalCodeDiv.innerHTML = `
                <h3>Tu código de retiro:</h3>
                <p>${code.substring(0, 4)} ${code.substring(4, 8)}</p>
                <small>Este código es válido por 10 minutos.</small>
            `;
            withdrawalCodeDiv.classList.remove('hidden');
        });
    }

    function renderPendingBills() {
        const pendingBillsContainer = document.getElementById('pending-bills');
        pendingBillsContainer.innerHTML = '<h3>Recibos Pendientes</h3>'; // Reset

        userData.pendingBills.forEach(bill => {
            const billCard = document.createElement('div');
            billCard.className = 'bill-card overdue';
            billCard.onclick = () => switchPage(`pay-confirm-${bill.id}`);

            billCard.innerHTML = `
                <div class="bill-card-header">
                    <h4>${bill.service}</h4>
                    <span class="overdue-tag">VENCIDO</span>
                </div>
                <div class="bill-card-body">
                    <p><strong>Monto:</strong> $${bill.amount.toFixed(2)}</p>
                    <p><strong>Fecha Límite:</strong> ${bill.dueDate}</p>
                </div>
            `;
            pendingBillsContainer.appendChild(billCard);
        });
    }

    function createPaymentConfirmationPages() {
        const container = document.getElementById('pay-confirm-container');
        userData.pendingBills.forEach(bill => {
            const page = document.createElement('div');
            page.id = `pay-confirm-${bill.id}`;
            page.className = 'page hidden';

            page.innerHTML = `
                <header class="page-header">
                    <button class="back-btn" onclick="switchPage('pay')"><i class="fas fa-arrow-left"></i></button>
                    <h2>Confirmar Pago</h2>
                </header>
                <div class="confirmation-details">
                    <h3>${bill.service}</h3>
                    <p><strong>Número de Suscriptor:</strong> ${bill.subscriberNumber}</p>
                    <p><strong>Paquete:</strong> ${bill.package}</p>
                    <p><strong>Fecha Límite de Pago:</strong> ${bill.dueDate}</p>
                    <div class="confirmation-amount">
                        <p>Total a Pagar:</p>
                        <span>$${bill.amount.toFixed(2)}</span>
                    </div>
                </div>
                <button class="btn-primary" onclick="payBill('${bill.id}')">Pagar Ahora</button>
            `;
            container.appendChild(page);
        });
    }

    payBill = (billId) => {
        const billIndex = userData.pendingBills.findIndex(b => b.id === billId);
        if (billIndex > -1) {
            const bill = userData.pendingBills[billIndex];

            // Add to transaction history
            userData.transactions.unshift({
                date: new Date().toLocaleDateString('es-ES'),
                description: `Pago de servicio: ${bill.service}`,
                amount: -bill.amount
            });

            // "Pay" the bill by removing it from pending
            userData.pendingBills.splice(billIndex, 1);

            // Re-render related content
            renderPendingBills();
            renderTransactions(); // Update transaction history
            createPaymentConfirmationPages(); // Re-create pages in case of changes

            showOverlay();
        } else {
            alert('Error: No se encontró el recibo.');
        }
    };

    function renderTransactions() {
        const movementsTab = document.getElementById('movements');
        movementsTab.innerHTML = ''; // Clear existing content

        if (userData.transactions.length === 0) {
            movementsTab.innerHTML = '<p>No hay movimientos recientes.</p>';
            return;
        }

        userData.transactions.forEach(tx => {
            const txElement = document.createElement('div');
            txElement.className = 'transaction-item';

            const amountClass = tx.amount < 0 ? 'expense' : 'income';

            txElement.innerHTML = `
                <div class="transaction-details">
                    <p class="transaction-description">${tx.description}</p>
                    <p class="transaction-date">${tx.date}</p>
                </div>
                <p class="transaction-amount ${amountClass}">$${tx.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            `;
            movementsTab.appendChild(txElement);
        });
    }

    function updateNavActiveState(pageId) {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            // A bit of logic to match button to pageId, assuming the onclick is `switchPage('pageName')`
            const btnPage = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
            if (btnPage === pageId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Run the app
    init();
});
