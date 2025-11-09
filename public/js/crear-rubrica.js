let criterioCount = 0;

function Exit(){
    Swal.fire({
        icon: 'warning',
        title: 'Validación',
        text: '¿Estás seguro que deseas salir?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if(result.isConfirmed){
            window.location.href = '/login'
        }
    });
}

// Agregar un criterio nuevo
function agregarCriterio() {
    criterioCount++;
    const criterioHTML = `
        <div class="criterio-card" data-criterio="${criterioCount}">
            <div class="criterio-header">
                <input type="text" class="form-input criterio-descripcion" 
                    placeholder="Descripción del criterio" required>
                <button type="button" class="btn-icon" onclick="eliminarCriterio(${criterioCount})" title="Eliminar Criterio">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="criterio-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Puntaje Máximo *</label>
                        <input type="number" class="form-input criterio-puntaje" 
                            min="0" step="0.01" placeholder="10" required>
                    </div>
                    <div class="form-group">
                        <label>Orden</label>
                        <input type="number" class="form-input criterio-orden" 
                            value="${criterioCount}" min="1" required>
                    </div>
                </div>

                <!-- Niveles de Desempeño -->
                <div class="niveles-section">
                    <div class="niveles-header">
                        <h4><i class="fas fa-star"></i> Niveles de Desempeño</h4>
                        <button type="button" class="btn-add" onclick="agregarNivel(${criterioCount})">
                            <i class="fas fa-plus"></i> Agregar Nivel
                        </button>
                    </div>
                    <div class="niveles-list" id="niveles-${criterioCount}">
                        <!-- Niveles se agregan aquí -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('criteriosList').insertAdjacentHTML('beforeend', criterioHTML);
    
    // Agregar niveles por defecto
    agregarNivel(criterioCount, 'Sobresaliente', 1);
    agregarNivel(criterioCount, 'Notable', 2);
    agregarNivel(criterioCount, 'Aprobado', 3);
    agregarNivel(criterioCount, 'Insuficiente', 4);
}

// Eliminar un criterio
function eliminarCriterio(id) {
    Swal.fire({
        title: '¿Eliminar criterio?',
        text: 'Se eliminarán todos los niveles de este criterio',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            document.querySelector(`[data-criterio="${id}"]`).remove();
        }
    });
}

// Agregar un nivel de desempeño
function agregarNivel(criterioId, nombreDefault = '', ordenDefault = '') {
    const nivelCount = document.querySelectorAll(`#niveles-${criterioId} .nivel-item`).length + 1;
    const orden = ordenDefault || nivelCount;
    const nombre = nombreDefault || '';
    
    const nivelHTML = `
        <div class="nivel-item">
            <div class="nivel-header">
                <input type="text" class="form-input nivel-nombre" 
                    placeholder="Nombre del nivel" value="${nombre}" required style="flex: 1;">
                <input type="number" class="form-input small-input nivel-puntaje" 
                    placeholder="Puntaje" min="0" step="0.01" required>
                <input type="number" class="form-input small-input nivel-orden" 
                    placeholder="Orden" value="${orden}" min="1" required>
                <button type="button" class="btn-icon" onclick="eliminarNivel(this)" title="Eliminar Nivel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <textarea class="form-textarea nivel-descripcion" rows="2" 
                    placeholder="Descripción del nivel de desempeño..." required></textarea>
            </div>
        </div>
    `;
    
    document.getElementById(`niveles-${criterioId}`).insertAdjacentHTML('beforeend', nivelHTML);
}

// Eliminar un nivel
function eliminarNivel(button) {
    button.closest('.nivel-item').remove();
}

// Manejar el envío del formulario
document.getElementById('rubricaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar que haya al menos un criterio
    const criterios = document.querySelectorAll('.criterio-card');
    if(criterios.length === 0) {
        Swal.fire('Error', 'Debe agregar al menos un criterio de evaluación', 'error');
        return;
    }
    
    // Recopilar datos de la rúbrica
    const rubricaData = {
        nombre_rubrica: document.getElementById('nombreRubrica').value,
        materia_codigo: document.getElementById('materia').value,
        seccion_id: document.getElementById('seccion').value,
        fecha_evaluacion: document.getElementById('fechaEvaluacion').value,
        porcentaje_evaluacion: document.getElementById('porcentaje').value,
        tipo_evaluacion: document.getElementById('tipoEvaluacion').value,
        competencias: document.getElementById('competencias').value,
        instrucciones: document.getElementById('instrucciones').value,
        criterios: []
    };
    
    // Recopilar criterios y niveles
    criterios.forEach((criterioCard) => {
        const criterio = {
            descripcion: criterioCard.querySelector('.criterio-descripcion').value,
            puntaje_maximo: parseFloat(criterioCard.querySelector('.criterio-puntaje').value),
            orden: parseInt(criterioCard.querySelector('.criterio-orden').value),
            niveles: []
        };
        
        // Recopilar niveles del criterio
        const niveles = criterioCard.querySelectorAll('.nivel-item');
        niveles.forEach(nivelItem => {
            const nivel = {
                nombre_nivel: nivelItem.querySelector('.nivel-nombre').value,
                descripcion: nivelItem.querySelector('.nivel-descripcion').value,
                puntaje: parseFloat(nivelItem.querySelector('.nivel-puntaje').value),
                orden: parseInt(nivelItem.querySelector('.nivel-orden').value)
            };
            criterio.niveles.push(nivel);
        });
        
        rubricaData.criterios.push(criterio);
    });
    
    // Validar que cada criterio tenga al menos un nivel
    let criterioSinNiveles = false;
    rubricaData.criterios.forEach((criterio, index) => {
        if(criterio.niveles.length === 0) {
            criterioSinNiveles = true;
        }
    });
    
    if(criterioSinNiveles) {
        Swal.fire('Error', 'Cada criterio debe tener al menos un nivel de desempeño', 'error');
        return;
    }
    
    // Mostrar loading
    Swal.fire({
        title: 'Guardando rúbrica...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Crear FormData y agregar todos los campos
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/envioRubrica';
    
    // Agregar campos simples
    const campos = ['nombre_rubrica', 'materia_codigo', 'seccion_id', 'fecha_evaluacion', 
                    'porcentaje_evaluacion', 'tipo_evaluacion', 'competencias', 'instrucciones'];
    
    campos.forEach(campo => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = campo;
        input.value = rubricaData[campo];
        form.appendChild(input);
    });
    
    // Agregar criterios como JSON
    const criteriosInput = document.createElement('input');
    criteriosInput.type = 'hidden';
    criteriosInput.name = 'criterios';
    criteriosInput.value = JSON.stringify(rubricaData.criterios);
    form.appendChild(criteriosInput);
    
    document.body.appendChild(form);
    form.submit();
});

// Agregar primer criterio automáticamente al cargar
window.addEventListener('DOMContentLoaded', () => {
    agregarCriterio();
});