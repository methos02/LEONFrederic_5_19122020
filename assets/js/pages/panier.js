const products = {};
const basket = getBasket();

document.addEventListener("DOMContentLoaded", () => {
    insertProducts().then(() => calculTotalPrice());

    setPatternError('zip', "Le code postale doit être composé de 5 chiffres.", "input");
    setPatternError('email', "L'adresse mail est invalide.", "focusout");

    document.getElementById('formOrder').addEventListener('submit', function(e) {sendForm(e);});
});

async function insertProducts() {
    if( basket.products.length > 0 ) {
        await Promise.all(
            basket.products.map(async (product) => {
                products[product.id] = await getProduct(product.id);
                insertRow(products[product.id], product.colors);
            })
        )

        return;
    }

    document.getElementById('page__basket-empty').style.display = 'flex';
    document.getElementById('page__basket-table').style.display = 'none';
}

/**
 *
 * @param product
 * @param colors
 */
function insertRow(product, colors) {
    const tbody = document.querySelector('tbody');

    colors.map((color) => {
        const row = generateRow(product, color);

        row.querySelectorAll('input[name=product_numb]').forEach(function (input) {
            input.addEventListener('change', function() { updateBasket(this); });
        });

        row.querySelectorAll('[data-product_delete]').forEach(function (btn) {
            btn.addEventListener('click', function() { removeRowFromBasket(this); });
        });

        tbody.appendChild(row);
    });
}

function generateRow(product, color) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-product_id', product._id);

    tr.innerHTML += '<td class="product-row__delete" data-product_delete><img src="/assets/images/trash.svg" alt="icone de poubelle"></td>';
    tr.innerHTML += '<td>' + product.name + '</td>';
    tr.innerHTML += '<td data-product_color>' + color.name + '</td>';
    tr.innerHTML += '<input name="product_numb" type="number" min="1" title="Nombre de produit" value="' + color.nb + '">';
    tr.innerHTML += '<td data-product_price>' + formatPrice(color.nb * product.price) + '</td>';

    return tr;
}

function updateBasket(input) {
    const row = input.closest('tr');
    const product_id = row.getAttribute('data-product_id');
    const nb_product = row.querySelector('[name=product_numb]').value;

    if(products[product_id] === undefined) {
        return addErrorToast('Le produit est introuvable');
    }

    const total_product = basketAddOrUpdateProduct(products[product_id], {
        name: row.querySelector('[data-product_color]').textContent,
        nb: nb_product
    });

    row.querySelector('[data-product_price]').textContent = formatPrice(nb_product * products[product_id].price);
    animate_logo_basket(total_product);
    calculTotalPrice();
}

function removeRowFromBasket(btn) {
    const row = btn.closest('tr');
    const color = row.querySelector('[data-color]').textContent;
    const nb_product = localBasketRemoveProduct(product_id, color);

    updateBasket(nb_product);
    addSuccessToast('Ce nounours a bien été supprimé :\'(');
    calculTotalPrice();
}

function calculTotalPrice() {
    const total_price = basket.products.reduce((current_price, product_basket) => {
        const nb_product = product_basket.colors.reduce((current_nb, color) => parseInt(color.nb) + current_nb , 0);
        return nb_product * products[product_basket.id].price + current_price
    }, 0)

    document.querySelector('[data-total_price]').textContent = formatPrice(total_price);
}


function setPatternError(input_name, error, event) {
    const input = document.getElementById(input_name);
    input.addEventListener(event, () => input.setCustomValidity(input.validity.patternMismatch ? error : ""));
}

async function sendForm(e) {
    e.preventDefault();

    const response = await fetch('http://localhost:3000/api/teddies/order', {
        headers: new Headers({"Content-Type" : "application/json"}),
        method: 'POST',
        body: JSON.stringify({ contact : getFormDatas(e.target), products : basket.products.map( product => product.id) })
    });

    const result = await response.json();

    document.getElementById('order_name').innerText = result.contact.firstName;
    document.getElementById('order_number').innerText = result.orderId;

    //emptyBasket();
    switchElementById('order-success', 'order-form');
    switchElementById('page__basket-empty', 'page__basket-table')
}

function getFormDatas(form) {
    const datas = {};

    form.querySelectorAll('input').forEach((input) => {
        datas[input.getAttribute('name')] = input.value;
    });

    return datas;
}
