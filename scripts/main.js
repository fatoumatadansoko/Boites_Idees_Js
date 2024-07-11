document.addEventListener('DOMContentLoaded', function() { 
    const ideeContainer = document.querySelector('#idee-container');
    const ideeURL = 'http://localhost:3000/idees';
    let allIdees = [];

    // Fonction pour afficher les idées
    const displayIdees = (idees) => {
        ideeContainer.innerHTML = '';
        idees.forEach(function(idee) { 
            ideeContainer.innerHTML += ` 
            <div id="idee-${idee.id}"> 
                <h2>${idee.libelle}</h2> 
                <h4>${idee.auteur}</h4> 
                <h4>${idee.etat}</h4> 
                <h4>${idee.categorie}</h4> 
                <p>${idee.message}</p> 
                <button data-id="${idee.id}" id="edit-${idee.id}" data-action="edit">Modifier</button> 
                <button data-id="${idee.id}" id="delete-${idee.id}" data-action="delete">Supprimer</button> 
            </div>`;
        });
    };

    // Récupération et affichage des idées existantes
    fetch(`${ideeURL}`) 
    .then(response => response.json()) 
    .then(ideeData => {
        allIdees = ideeData;
        displayIdees(allIdees);
    });

    // Gestion de la soumission du formulaire
    const ideeForm = document.querySelector('#idee-form');
    ideeForm.addEventListener('submit', (e) => { 
        e.preventDefault();

        const libelleInput = ideeForm.querySelector('#libelle').value;
        const auteurInput = ideeForm.querySelector('#auteur').value;
        const messageInput = ideeForm.querySelector('#message').value;
        const etatInput = ideeForm.querySelector('#etat').value;
        const categorieInput = ideeForm.querySelector('#categorie').value;

        fetch(`${ideeURL}`, { 
            method: 'POST', 
            body: JSON.stringify({ 
                libelle: libelleInput, 
                auteur: auteurInput, 
                etat: etatInput, 
                categorie: categorieInput, 
                message: messageInput 
            }), 
            headers: { 
                'Content-Type': 'application/json' 
            }
        }).then(response => response.json())
        .then(idee => { 
            allIdees.push(idee);
            displayIdees(allIdees);
        });
    });

    // Gestion des boutons modifier et supprimer
    ideeContainer.addEventListener('click', (e) => {
        const ideeId = e.target.dataset.id;

        if (e.target.dataset.action === 'edit') {
            const currentIdee = allIdees.find(idee => idee.id == ideeId);
            const editFormHTML = `
                <form id="edit-form">
                    <label for="edit-etat">État:</label>
                    <select id="edit-etat" name="etat">
                        <option value="approuvée" ${currentIdee.etat === 'approuvée' ? 'selected' : ''}>Approuvée</option>
                        <option value="désapprouvée" ${currentIdee.etat === 'désapprouvée' ? 'selected' : ''}>Désapprouvée</option>
                    </select>
                    <input type="submit" value="Modifier">
                </form>
            `;

            const ideeDiv = document.querySelector(`#idee-${ideeId}`);
            ideeDiv.innerHTML += editFormHTML;

            const editForm = document.querySelector('#edit-form');
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newEtat = document.querySelector('#edit-etat').value;

                fetch(`${ideeURL}/${ideeId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ etat: newEtat }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => response.json())
                .then(updatedIdee => {
                    const ideeIndex = allIdees.findIndex(idee => idee.id == updatedIdee.id);
                    allIdees[ideeIndex] = updatedIdee;
                    displayIdees(allIdees);
                });
            });
        } else if (e.target.dataset.action === 'delete') {
            fetch(`${ideeURL}/${ideeId}`, {
                method: 'DELETE'
            }).then(() => {
                allIdees = allIdees.filter(idee => idee.id != ideeId);
                displayIdees(allIdees);
            });
        }
    });
});
