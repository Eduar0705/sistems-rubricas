// ============================================================
// crear-rubrica.js - CÓDIGO COMPLETO CORREGIDO
// Sistema de Creación de Rúbricas
// ============================================================

let criterioCount = 0;

// Función para salir
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

// ============================================================
// VALIDACIÓN DE CRITERIOS Y NIVELES
// ============================================================

function validarEstructuraCriterios(criterios) {
    if (!Array.isArray(criterios) || criterios.length === 0) {
        return { valido: false, mensaje: 'Debe agregar al menos un criterio' };
    }
    
    for (let i = 0; i < criterios.length; i++) {
        const criterio = criterios[i];
        
        if (!criterio.descripcion || criterio.descripcion.trim() === '') {
            return { valido: false, mensaje: `El criterio ${i + 1} necesita descripción` };
        }
        
        if (!criterio.puntaje_maximo || criterio.puntaje_maximo <= 0) {
            return { valido: false, mensaje: `El criterio ${i + 1} necesita un puntaje máximo válido` };
        }
        
        if (!criterio.niveles || !Array.isArray(criterio.niveles) || criterio.niveles.length === 0) {
            return { valido: false, mensaje: `El criterio ${i + 1} necesita al menos un nivel de desempeño` };
        }
        
        for (let j = 0; j < criterio.niveles.length; j++) {
            const nivel = criterio.niveles[j];
            
            if (!nivel.nombre_nivel || nivel.nombre_nivel.trim() === '') {
                return { valido: false, mensaje: `El nivel ${j + 1} del criterio ${i + 1} necesita nombre` };
            }
            
            if (nivel.puntaje === undefined || nivel.puntaje === null || isNaN(nivel.puntaje)) {
                return { valido: false, mensaje: `El nivel ${j + 1} del criterio ${i + 1} necesita un puntaje válido` };
            }
            
            if (!nivel.descripcion || nivel.descripcion.trim() === '') {
                return { valido: false, mensaje: `El nivel "${nivel.nombre_nivel}" del criterio ${i + 1} necesita descripción` };
            }
            
            if (parseFloat(nivel.puntaje) > parseFloat(criterio.puntaje_maximo)) {
                return { 
                    valido: false, 
                    mensaje: `El puntaje del nivel "${nivel.nombre_nivel}" (${nivel.puntaje}) excede el puntaje máximo del criterio (${criterio.puntaje_maximo})` 
                };
            }
        }
    }
    
    return { valido: true };
}

// Validar puntajes en tiempo real
function validarPuntajes() {
    const porcentajeEvaluacion = parseFloat(document.getElementById('porcentaje')?.value) || 0;
    const criterios = document.querySelectorAll('.criterio-card');
    let sumaCriterios = 0;
    let hayError = false;

    criterios.forEach((criterioCard) => {
        const puntajeInput = criterioCard.querySelector('.criterio-puntaje');
        const puntajeMaximo = parseFloat(puntajeInput?.value) || 0;
        sumaCriterios += puntajeMaximo;

        // Validar niveles del criterio
        const niveles = criterioCard.querySelectorAll('.nivel-item');
        niveles.forEach(nivelItem => {
            const puntajeNivelInput = nivelItem.querySelector('.nivel-puntaje');
            const puntajeNivel = parseFloat(puntajeNivelInput?.value) || 0;

            if (puntajeNivel > puntajeMaximo) {
                puntajeNivelInput.style.borderColor = '#e74c3c';
                puntajeNivelInput.title = `El puntaje del nivel no puede exceder ${puntajeMaximo}`;
                hayError = true;
            } else {
                puntajeNivelInput.style.borderColor = '#e0e0e0';
                puntajeNivelInput.title = '';
            }
        });
    });

    // Validar suma de criterios
    const porcentajeInput = document.getElementById('porcentaje');
    if (porcentajeInput) {
        if (sumaCriterios > porcentajeEvaluacion) {
            porcentajeInput.style.borderColor = '#e74c3c';
            porcentajeInput.title = `La suma de puntajes (${sumaCriterios}) excede el porcentaje (${porcentajeEvaluacion})`;
        } else {
            porcentajeInput.style.borderColor = '#e0e0e0';
            porcentajeInput.title = '';
        }
    }

    return !hayError && sumaCriterios <= porcentajeEvaluacion;
}

// Agregar event listeners para validación en tiempo real
function agregarValidacionTiempoReal() {
    const porcentajeInput = document.getElementById('porcentaje');
    if (porcentajeInput) {
        porcentajeInput.addEventListener('input', validarPuntajes);
    }

    // Observer para detectar cambios en criterios dinámicos
    const observer = new MutationObserver(function() {
        validarPuntajes();
    });

    const criteriosList = document.getElementById('criteriosList');
    if (criteriosList) {
        observer.observe(criteriosList, { 
            childList: true, 
            subtree: true,
            attributes: false
        });
    }

    // Listener global para inputs
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('criterio-puntaje') || 
            e.target.classList.contains('nivel-puntaje')) {
            validarPuntajes();
        }
    });
}

// ============================================================
// GESTIÓN DE CRITERIOS
// ============================================================

function agregarCriterio() {
    criterioCount++;
    const criterioHTML = `
        <div class="criterio-card" data-criterio="${criterioCount}">
            <div class="criterio-header">
                <input type="text" class="form-input criterio-descripcion" 
                    placeholder="Descripción del criterio (Ej: Análisis de datos)" required>
                <button type="button" class="btn-icon" onclick="eliminarCriterio(${criterioCount})" title="Eliminar Criterio">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="criterio-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Puntaje Máximo *</label>
                        <input type="number" class="form-input criterio-puntaje" 
                            min="0" step="0.01" placeholder="10" value="10" required>
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
    agregarNivel(criterioCount, 'Sobresaliente', 10, 1);
    agregarNivel(criterioCount, 'Notable', 8, 2);
    agregarNivel(criterioCount, 'Aprobado', 6, 3);
    agregarNivel(criterioCount, 'Insuficiente', 4, 4);
    
    // Validar después de agregar
    setTimeout(validarPuntajes, 100);
}

function eliminarCriterio(id) {
    const criterioCard = document.querySelector(`[data-criterio="${id}"]`);
    if (!criterioCard) return;
    
    const criteriosRestantes = document.querySelectorAll('.criterio-card').length;
    
    if (criteriosRestantes <= 1) {
        Swal.fire({
            icon: 'warning',
            title: 'No se puede eliminar',
            text: 'Debe mantener al menos un criterio de evaluación'
        });
        return;
    }
    
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
            criterioCard.remove();
            setTimeout(validarPuntajes, 100);
            Swal.fire('Eliminado', 'El criterio ha sido eliminado', 'success');
        }
    });
}

// ============================================================
// GESTIÓN DE NIVELES
// ============================================================

function agregarNivel(criterioId, nombreDefault = '', puntajeDefault = '', ordenDefault = '') {
    const nivelesContainer = document.getElementById(`niveles-${criterioId}`);
    if (!nivelesContainer) return;
    
    const nivelCount = nivelesContainer.querySelectorAll('.nivel-item').length + 1;
    const orden = ordenDefault || nivelCount;
    const nombre = nombreDefault || '';
    const puntaje = puntajeDefault || '';
    
    const nivelHTML = `
        <div class="nivel-item">
            <div class="nivel-header">
                <input type="text" class="form-input nivel-nombre" 
                    placeholder="Nombre del nivel" value="${nombre}" required style="flex: 1;">
                <input type="number" class="form-input small-input nivel-puntaje" 
                    placeholder="Puntaje" value="${puntaje}" min="0" step="0.01" required>
                <input type="number" class="form-input small-input nivel-orden" 
                    placeholder="Orden" value="${orden}" min="1" required>
                <button type="button" class="btn-icon" onclick="eliminarNivel(this, ${criterioId})" title="Eliminar Nivel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <textarea class="form-textarea nivel-descripcion" rows="2" 
                    placeholder="Descripción del nivel de desempeño..." required></textarea>
            </div>
        </div>
    `;
    
    nivelesContainer.insertAdjacentHTML('beforeend', nivelHTML);
    
    // Validar después de agregar
    setTimeout(validarPuntajes, 100);
}

function eliminarNivel(button, criterioId) {
    const nivelItem = button.closest('.nivel-item');
    const nivelesContainer = document.getElementById(`niveles-${criterioId}`);
    
    if (!nivelItem || !nivelesContainer) return;
    
    const nivelesRestantes = nivelesContainer.querySelectorAll('.nivel-item').length;
    
    if (nivelesRestantes <= 1) {
        Swal.fire({
            icon: 'warning',
            title: 'No se puede eliminar',
            text: 'Cada criterio debe tener al menos un nivel de desempeño'
        });
        return;
    }
    
    nivelItem.remove();
    setTimeout(validarPuntajes, 100);
}

// ============================================================
// ENVÍO DEL FORMULARIO
// ============================================================

const rubricaForm = document.getElementById('rubricaForm');
if (rubricaForm) {
    rubricaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar campos básicos
        const nombreRubrica = document.getElementById('nombreRubrica')?.value.trim();
        const materiaId = document.getElementById('materia')?.value;
        const seccionId = document.getElementById('seccion')?.value;
        const fechaEval = document.getElementById('fechaEvaluacion')?.value;
        const porcentaje = parseFloat(document.getElementById('porcentaje')?.value);
        const tipoEval = document.getElementById('tipoEvaluacion')?.value;

        if (!nombreRubrica) {
            Swal.fire('Error', 'El nombre de la rúbrica es obligatorio', 'error');
            return;
        }

        if (!materiaId) {
            Swal.fire('Error', 'Debe seleccionar una materia', 'error');
            return;
        }

        if (!seccionId) {
            Swal.fire('Error', 'Debe seleccionar una sección', 'error');
            return;
        }

        if (!fechaEval) {
            Swal.fire('Error', 'La fecha de evaluación es obligatoria', 'error');
            return;
        }

        if (!porcentaje || porcentaje <= 0 || porcentaje > 100) {
            Swal.fire('Error', 'El porcentaje debe estar entre 1 y 100', 'error');
            return;
        }

        if (!tipoEval) {
            Swal.fire('Error', 'Debe seleccionar un tipo de evaluación', 'error');
            return;
        }
        
        // Validar que haya al menos un criterio
        const criterios = document.querySelectorAll('.criterio-card');
        if(criterios.length === 0) {
            Swal.fire('Error', 'Debe agregar al menos un criterio de evaluación', 'error');
            return;
        }
        
        // Recopilar datos de la rúbrica
        const rubricaData = {
            nombre_rubrica: nombreRubrica,
            materia_codigo: materiaId,
            seccion_id: seccionId,
            fecha_evaluacion: fechaEval,
            porcentaje_evaluacion: porcentaje,
            tipo_evaluacion: tipoEval,
            competencias: document.getElementById('competencias')?.value || '',
            instrucciones: document.getElementById('instrucciones')?.value || '',
            criterios: []
        };
        
        // Recopilar criterios y niveles
        criterios.forEach((criterioCard) => {
            const descripcionInput = criterioCard.querySelector('.criterio-descripcion');
            const puntajeInput = criterioCard.querySelector('.criterio-puntaje');
            const ordenInput = criterioCard.querySelector('.criterio-orden');
            
            const criterio = {
                descripcion: descripcionInput?.value.trim() || '',
                puntaje_maximo: parseFloat(puntajeInput?.value) || 0,
                orden: parseInt(ordenInput?.value) || 0,
                niveles: []
            };
            
            // Recopilar niveles del criterio
            const niveles = criterioCard.querySelectorAll('.nivel-item');
            niveles.forEach(nivelItem => {
                const nombreInput = nivelItem.querySelector('.nivel-nombre');
                const descripcionInput = nivelItem.querySelector('.nivel-descripcion');
                const puntajeInput = nivelItem.querySelector('.nivel-puntaje');
                const ordenInput = nivelItem.querySelector('.nivel-orden');
                
                const nivel = {
                    nombre_nivel: nombreInput?.value.trim() || '',
                    descripcion: descripcionInput?.value.trim() || '',
                    puntaje: parseFloat(puntajeInput?.value) || 0,
                    orden: parseInt(ordenInput?.value) || 0
                };
                criterio.niveles.push(nivel);
            });
            
            rubricaData.criterios.push(criterio);
        });
        
        // Validar estructura completa
        const validacion = validarEstructuraCriterios(rubricaData.criterios);
        if (!validacion.valido) {
            Swal.fire('Error', validacion.mensaje, 'error');
            return;
        }
        
        // Validar suma de puntajes
        const sumaPuntajes = rubricaData.criterios.reduce((sum, c) => sum + c.puntaje_maximo, 0);
        if (sumaPuntajes > porcentaje) {
            Swal.fire('Error', 
                `La suma de puntajes máximos (${sumaPuntajes}) no puede exceder el porcentaje de evaluación (${porcentaje})`, 
                'error');
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
        //Verificacion si es admin o profesor
        // Determinar seccionId en cliente (fallback al input #seccion)
        const seccionValue = rubricaData.seccion_id ?? document.getElementById('seccion')?.value;
        const seccionIdNum = parseInt(seccionValue, 10) || 0;

        if (seccionIdNum === 1) {
            form.action = '/envioRubrica';
        } else {
            form.action = '/envioRubricaTeacher';
        }

        
        // Agregar campos simples
        const campos = ['nombre_rubrica', 'materia_codigo', 'seccion_id', 'fecha_evaluacion', 
                        'porcentaje_evaluacion', 'tipo_evaluacion', 'competencias', 'instrucciones'];
        
        campos.forEach(campo => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = campo;
            input.value = rubricaData[campo] || '';
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
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
    try {
        // Agregar primer criterio automáticamente
        agregarCriterio();
        
        // Agregar validación en tiempo real
        agregarValidacionTiempoReal();
        
        // Validación inicial
        setTimeout(validarPuntajes, 100);
    } catch (error) {
        console.error('Error en inicialización:', error);
    }
});