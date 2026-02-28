let criterioCount = 0;
let porcentajeEvaluacion = 10; // Valor inicial

// ============================================================
// SISTEMA DE SELECCIÓN JERÁRQUICO
// ============================================================

document.addEventListener('DOMContentLoaded', async function() {
    estrategias_eval = await cargarEstrategias();
    const carreraSelect = document.getElementById('carrera');
    const semestreSelect = document.getElementById('semestre');
    const materiaSelect = document.getElementById('materia');
    const seccionSelect = document.getElementById('seccion');
    const evalSelect = document.getElementById('evaluacion');
    const fechaInput = document.getElementById('fechaEvaluacion');
    const porcentajeInput = document.getElementById('porcentaje');
    const competenciasTextArea = document.getElementById('competencias');
    const instrumentosTextArea = document.getElementById('instrumentos');

    // Cuando cambia la carrera
    if (carreraSelect) {
        carreraSelect.addEventListener('change', async function() {
            const carreraCode = this.value;
            
            // Resetear selects dependientes
            semestreSelect.innerHTML = '<option value="">Cargando...</option>';
            materiaSelect.innerHTML = '<option value="">Primero seleccione un semestre</option>';
            evalSelect.innerHTML = '<option value="">Primero seleccione un semestre</option>';
            fechaInput.value = '';
            porcentajeInput.value = '';
            competenciasTextArea.value = '';
            instrumentosTextArea.value = '';
            
            materiaSelect.disabled = true;
            seccionSelect.disabled = true;
            evalSelect.disabled = true;

            if (!carreraCode) {
                semestreSelect.innerHTML = '<option value="">Primero seleccione una carrera</option>';
                semestreSelect.disabled = true;
                return;
            }

            try {
                const response = await fetch(`/api/admin/semestres/${carreraCode}`);
                const semestres = await response.json();
                
                semestreSelect.innerHTML = '<option value="">Seleccione un semestre</option>';
                semestres.forEach(sem => {
                    semestreSelect.innerHTML += `<option value="${sem}">Semestre ${sem}</option>`;
                });
                
                semestreSelect.disabled = false;
            } catch (error) {
                console.error('Error:', error);
                semestreSelect.innerHTML = '<option value="">Error al cargar semestres</option>';
                Swal.fire('Error', 'No se pudieron cargar los semestres', 'error');
            }
        });
    }

    // Cuando cambia el semestre
    if (semestreSelect) {
        semestreSelect.addEventListener('change', async function() {
            const carreraCode = carreraSelect.value;
            const semestre = this.value;
            
            materiaSelect.innerHTML = '<option value="">Cargando...</option>';
            seccionSelect.innerHTML = '<option value="">Primero seleccione una materia</option>';
            evalSelect.innerHTML = '<option value="">Primero seleccione un semestre</option>';
            seccionSelect.disabled = true;
            evalSelect.disabled = true;

            if (!semestre) {
                materiaSelect.innerHTML = '<option value="">Primero seleccione un semestre</option>';
                materiaSelect.disabled = true;
                return;
            }

            try {
                const response = await fetch(`/api/admin/materias/${carreraCode}/${semestre}`);
                const materias = await response.json();
                
                materiaSelect.innerHTML = '<option value="">Seleccione una materia</option>';
                materias.forEach(mat => {
                    materiaSelect.innerHTML += `<option value="${mat.codigo}">${mat.nombre}</option>`;
                });
                
                materiaSelect.disabled = false;
            } catch (error) {
                console.error('Error:', error);
                materiaSelect.innerHTML = '<option value="">Error al cargar materias</option>';
                Swal.fire('Error', 'No se pudieron cargar las materias', 'error');
            }
        });
    }

    // Cuando cambia la materia
    if (materiaSelect) {
        materiaSelect.addEventListener('change', async function() {
            const materiaCode = this.value;
            
            seccionSelect.innerHTML = '<option value="">Cargando...</option>';
            evalSelect.innerHTML = '<option value="">Primero seleccione un semestre</option>';
            evalSelect.disabled = true;

            if (!materiaCode) {
                seccionSelect.innerHTML = '<option value="">Primero seleccione una materia</option>';
                seccionSelect.disabled = true;
                return;
            }

            try {
                const response = await fetch(`/api/admin/secciones/${materiaCode}/${carreraSelect.value}`);
                const secciones = await response.json();
                
                seccionSelect.innerHTML = '<option value="">Seleccione una sección</option>';
                secciones.forEach(sec => {
                    const info = `${sec.codigo} - ${sec.lapso_academico}${sec.horario ? ' - ' + sec.horario : ''}`;
                    seccionSelect.innerHTML += `<option value="${sec.id}">${info}</option>`;
                });
                
                seccionSelect.disabled = false;
            } catch (error) {
                console.error('Error:', error);
                seccionSelect.innerHTML = '<option value="">Error al cargar secciones</option>';
                Swal.fire('Error', 'No se pudieron cargar las secciones', 'error');
            }
        });
    }
    // Cuando cambia la sección
    if (seccionSelect) {
        seccionSelect.addEventListener('change', async function() {
            const seccionId = this.value;
            
            evalSelect.innerHTML = '<option value="">Cargando...</option>';

            if (!seccionId) {
                evalSelect.innerHTML = '<option value="">Primero seleccione una materia</option>';
                evalSelect.disabled = true;
                return;
            }

            try {
                const response = await fetch(`/admin/evaluaciones/${seccionId}`);
                const evaluaciones = await response.json();
                
                if(evaluaciones.length > 0)
                {
                    evalSelect.innerHTML = '<option value="">Seleccione una evaluación</option>';
                    evaluaciones.evaluaciones.forEach(evalu => {
                        const info = `${evalu.contenido_evaluacion} ${evalu.tipo_evaluacion ? '- ' + evalu.tipo_evaluacion : ''}`;
                        evalSelect.innerHTML += `<option value="${evalu.evaluacion_id}">${info}</option>`;
                    });
                    
                    evalSelect.disabled = false;
                }
                else
                {
                    evalSelect.innerHTML = `<option value="">No encontradas.</option>`;
                    Swal.fire('0 evaluaciones sin rubrica encontradas', 'No se encontraron evaluaciones sin rubricas para esta sección. ¡Crea una y vuelve a intentar!', 'info');
                }
            } catch (error) {
                console.error('Error:', error);
                evalSelect.innerHTML = '<option value="">Error al cargar evaluaciones</option>';
                Swal.fire('Error', 'No se pudieron cargar las evaluaciones', 'error');
            }
        });
    }
    if (evalSelect) {
        evalSelect.addEventListener('change', async function() {
            const evalId = this.value;
            fechaInput.placeholder = 'Cargando...';
            porcentajeInput.placeholder = 'Cargando...';
            competenciasTextArea.value = 'Cargando...';
            instrumentosTextArea.value = 'Cargando...';

            if (!evalId) {
                fechaInput.placeholder = 'dd/mm/aaaa';
                porcentajeInput.placeholder = 'Mínimo 1%';
                competenciasTextArea.value = '';
                instrumentosTextArea.value = '';
                return;
            }

            try {
                const response = await fetch(`/api/admin/evaluacion/${evalId}`);
                const data = await response.json();

                fechaInput.value = formatearFechaParaInput(new Date(data.evaluacion.fecha_evaluacion));
                porcentajeInput.value = data.evaluacion.porcentaje;
                competenciasTextArea.value = data.evaluacion.competencias;
                instrumentosTextArea.value = data.evaluacion.instrumentos;
                cargarEstrategiasEdit(estrategias_eval, data.evaluacion.estrategias)
                
            } catch (error) {
                console.error('Error:', error);
                //evalSelect.innerHTML = '<option value="">Error al cargar evaluaciones</option>';
                Swal.fire('Error', 'No se pudo cargar la evaluación, pruebe de nuevo más tarde.', 'error');
            }
        });
    }

    // Inicializar
    agregarCriterio();
    agregarValidacionTiempoReal();
    setTimeout(calcularDistribucionAutomatica, 100);
});
function cargarEstrategiasEdit(listaEstrategias, seleccionadas = []) {
    const container = document.getElementById('estrategias_eval');
    container.innerHTML = '';
    listaEstrategias.forEach(est => {
        const label = document.createElement('label');
        label.className = 'estrategia-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.disabled = true;
        checkbox.value = est.id;
        checkbox.checked = seleccionadas.includes(est.id);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`  ${est.nombre}`));
        container.appendChild(label);
    });
}
function formatearFechaParaInput(fecha) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
async function cargarEstrategias() {
    try {
        const response = await fetch('/api/estrategias_eval');
        const data = await response.json();

        if (data.success) {
            const div = document.getElementById('estrategias_eval');
            div.innerHTML = ''
            const labelHTML = ``;
            let checkboxesHTML = '';
            data.estrategias_eval.forEach(estrategia => {
                checkboxesHTML += `
                    <div class="estrategia-item">
                        <input type="checkbox" 
                               class="form-check-input" 
                               id="estrategia_${estrategia.id}" 
                               value="${estrategia.id}"
                               name="estrategias[]"
                               ${estrategia.ponderable == 0 ? `onclick="verificarPonderacion(${estrategia.id})"` : 'onclick="verificarFormularioCompleto()"'}
                               disabled>
                        <label class="form-check-label" 
                               for="estrategia_${estrategia.id}">
                            ${estrategia.nombre}
                        </label>
                    </div>
                `;
            });

            div.innerHTML = labelHTML + checkboxesHTML;
            return data.estrategias_eval
        }
    } catch (error) {
        console.error('Error al cargar carreras:', error);
        Swal.fire('Error', 'No se pudieron cargar las carreras', 'error');
    }
}
// ============================================================
// DISTRIBUCIÓN AUTOMÁTICA DE PUNTAJES
// ============================================================
function calcularDistribucionAutomatica() {
    const porcentajeInput = document.getElementById('porcentaje');
    if (!porcentajeInput) return;

    porcentajeEvaluacion = parseFloat(porcentajeInput.value) || 10;
    
    // Validar porcentaje mínimo
    if (porcentajeEvaluacion < 5) {
        porcentajeInput.value = 5;
        porcentajeEvaluacion = 5;
    }

    const criterios = document.querySelectorAll('.criterio-card');
    const numCriterios = criterios.length;

    if (numCriterios === 0) return;

    // Calcular puntaje por criterio (mínimo 1 punto por criterio)
    const puntajePorCriterio = Math.max(1, Math.floor((porcentajeEvaluacion / numCriterios) * 100) / 100);
    
    // Actualizar puntajes de criterios
    criterios.forEach((criterioCard, index) => {
        const puntajeInput = criterioCard.querySelector('.criterio-puntaje');
        if (puntajeInput) {
            puntajeInput.value = puntajePorCriterio.toFixed(2);
            actualizarPuntajesNiveles(criterioCard, puntajePorCriterio);
        }
    });

    // Mostrar información de distribución
    mostrarInfoDistribucion(numCriterios, puntajePorCriterio);
    validarPuntajes();
}

function actualizarPuntajesNiveles(criterioCard, puntajeMaximoCriterio) {
    const niveles = criterioCard.querySelectorAll('.nivel-item');
    const numNiveles = niveles.length;

    if (numNiveles === 0) return;

    // Distribuir puntaje entre niveles de manera descendente
    niveles.forEach((nivelItem, index) => {
        const puntajeInput = nivelItem.querySelector('.nivel-puntaje');
        if (puntajeInput) {
            // Puntaje descendente: el primero tiene el máximo, el último el mínimo
            const factorDistribucion = (numNiveles - index) / numNiveles;
            let puntaje = puntajeMaximoCriterio * factorDistribucion;
            
            // Redondear a 2 decimales y asegurar mínimo de 0.25
            puntaje = Math.max(0.25, Math.round(puntaje * 100) / 100);
            
            puntajeInput.value = puntaje.toFixed(2);
        }
    });
}

function mostrarInfoDistribucion(numCriterios, puntajePorCriterio) {
    const infoDiv = document.getElementById('distribucionInfo');
    const textoSpan = document.getElementById('distribucionTexto');
    
    if (infoDiv && textoSpan) {
        const total = (numCriterios * puntajePorCriterio).toFixed(2);
        textoSpan.textContent = `Distribución automática: ${numCriterios} criterio(s) × ${puntajePorCriterio.toFixed(2)} puntos = ${total} puntos de ${porcentajeEvaluacion}%`;
        infoDiv.style.display = 'block';
    }
}

// ============================================================
// VALIDACIÓN DE PUNTAJES
// ============================================================

function validarPuntajes() {
    const porcentajeInput = document.getElementById('porcentaje');
    const criterios = document.querySelectorAll('.criterio-card');
    let sumaCriterios = 0;
    let hayError = false;

    criterios.forEach((criterioCard) => {
        const puntajeInput = criterioCard.querySelector('.criterio-puntaje');
        const puntajeMaximo = parseFloat(puntajeInput?.value) || 0;
        
        // Validar mínimo de 1 punto por criterio
        if (puntajeMaximo < 1) {
            puntajeInput.style.borderColor = '#e74c3c';
            puntajeInput.title = 'El puntaje mínimo por criterio es 1 punto';
            hayError = true;
        } else {
            sumaCriterios += puntajeMaximo;
        }

        // Validar niveles del criterio
        const niveles = criterioCard.querySelectorAll('.nivel-item');
        niveles.forEach(nivelItem => {
            const puntajeNivelInput = nivelItem.querySelector('.nivel-puntaje');
            const puntajeNivel = parseFloat(puntajeNivelInput?.value) || 0;

            // Validar mínimo de 0.25 por nivel
            if (puntajeNivel < 0.25) {
                puntajeNivelInput.style.borderColor = '#e74c3c';
                puntajeNivelInput.title = 'El puntaje mínimo por nivel es 0.25';
                hayError = true;
            } else if (puntajeNivel > puntajeMaximo) {
                puntajeNivelInput.style.borderColor = '#e74c3c';
                puntajeNivelInput.title = `El puntaje del nivel no puede exceder ${puntajeMaximo}`;
                hayError = true;
            } else {
                puntajeNivelInput.style.borderColor = '#e0e0e0';
                puntajeNivelInput.title = '';
            }
        });
    });

    // Validar porcentaje
    if (porcentajeInput) {
        const porcentaje = parseFloat(porcentajeInput.value) || 0;
        
        if (porcentaje < 5) {
            porcentajeInput.style.borderColor = '#e74c3c';
            porcentajeInput.title = 'El porcentaje mínimo es 5%';
            hayError = true;
        } else if (sumaCriterios > porcentaje) {
            porcentajeInput.style.borderColor = '#e74c3c';
            porcentajeInput.title = `La suma de puntajes (${sumaCriterios.toFixed(2)}) excede el porcentaje (${porcentaje})`;
            hayError = true;
        } else {
            porcentajeInput.style.borderColor = '#e0e0e0';
            porcentajeInput.title = '';
        }
    }

    return !hayError;
}

function agregarValidacionTiempoReal() {
    const porcentajeInput = document.getElementById('porcentaje');
    if (porcentajeInput) {
        porcentajeInput.addEventListener('input', function() {
            calcularDistribucionAutomatica();
        });
    }

    // Observador para detectar cambios
    const observer = new MutationObserver(function() {
        validarPuntajes();
    });

    const criteriosList = document.getElementById('criteriosList');
    if (criteriosList) {
        observer.observe(criteriosList, { 
            childList: true, 
            subtree: true
        });
    }

    // Listener global
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('criterio-puntaje') || 
            e.target.classList.contains('nivel-puntaje')) {
            validarPuntajes();
        }
    });
}

// ============================================================
// VALIDACIÓN DE CRITERIOS
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
        
        if (!criterio.puntaje_maximo || criterio.puntaje_maximo < 1) {
            return { valido: false, mensaje: `El criterio ${i + 1} necesita un puntaje mínimo de 1 punto` };
        }
        
        if (!criterio.niveles || !Array.isArray(criterio.niveles) || criterio.niveles.length === 0) {
            return { valido: false, mensaje: `El criterio ${i + 1} necesita al menos un nivel de desempeño` };
        }
        
        for (let j = 0; j < criterio.niveles.length; j++) {
            const nivel = criterio.niveles[j];
            
            if (!nivel.nombre_nivel || nivel.nombre_nivel.trim() === '') {
                return { valido: false, mensaje: `El nivel ${j + 1} del criterio ${i + 1} necesita nombre` };
            }
            
            if (nivel.puntaje === undefined || nivel.puntaje < 0.25) {
                return { valido: false, mensaje: `El nivel "${nivel.nombre_nivel}" necesita un puntaje mínimo de 0.25` };
            }
            
            if (!nivel.descripcion || nivel.descripcion.trim() === '') {
                return { valido: false, mensaje: `El nivel "${nivel.nombre_nivel}" necesita descripción` };
            }
            
            if (parseFloat(nivel.puntaje) > parseFloat(criterio.puntaje_maximo)) {
                return { 
                    valido: false, 
                    mensaje: `El puntaje del nivel "${nivel.nombre_nivel}" (${nivel.puntaje}) excede el máximo del criterio (${criterio.puntaje_maximo})` 
                };
            }
        }
    }
    
    return { valido: true };
}

// ============================================================
// GESTIÓN DE CRITERIOS
// ============================================================

function agregarCriterio() {
    criterioCount++;
    const porcentaje = parseFloat(document.getElementById('porcentaje')?.value) || 10;
    const numCriteriosActuales = document.querySelectorAll('.criterio-card').length + 1;
    const puntajeSugerido = Math.max(1, (porcentaje / numCriteriosActuales).toFixed(2));
    
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
                        <label>Puntaje Máximo * (mín: 1)</label>
                        <input type="number" class="form-input criterio-puntaje" 
                            min="1" step="0.01" placeholder="${puntajeSugerido}" value="${puntajeSugerido}" required>
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
    
    // Agregar niveles por defecto con distribución automática
    const puntajeMaximo = parseFloat(puntajeSugerido);
    agregarNivel(criterioCount, 'Sobresaliente', puntajeMaximo.toFixed(2), 1);
    agregarNivel(criterioCount, 'Notable', (puntajeMaximo * 0.8).toFixed(2), 2);
    agregarNivel(criterioCount, 'Aprobado', (puntajeMaximo * 0.6).toFixed(2), 3);
    agregarNivel(criterioCount, 'Insuficiente', Math.max(0.25, (puntajeMaximo * 0.4)).toFixed(2), 4);
    
    calcularDistribucionAutomatica();
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
        text: 'Se eliminarán todos los niveles de este criterio y se redistribuirán los puntajes',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            criterioCard.remove();
            calcularDistribucionAutomatica();
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
    const puntaje = puntajeDefault || '0.25';
    
    const nivelHTML = `
        <div class="nivel-item">
            <div class="nivel-header">
                <input type="text" class="form-input nivel-nombre" 
                    placeholder="Nombre del nivel" value="${nombre}" required style="flex: 1;">
                <input type="number" class="form-input small-input nivel-puntaje" 
                    placeholder="Puntaje" value="${puntaje}" min="0.25" step="0.01" required>
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
    rubricaForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // ============================================================
    // VALIDACIONES DEL FRONTEND (rápidas)
    // ============================================================
    
    const nombreRubrica = document.getElementById('nombreRubrica')?.value.trim();
    const tipoRubrica = document.getElementById('tipoRubrica').value.trim();
    const instrucciones = document.getElementById('instrucciones')?.value.trim();
    const idEval = document.getElementById('evaluacion')?.value;
    const porcentaje = parseFloat(document.getElementById('porcentaje')?.value);

    // Resetear bordes rojos
    document.querySelectorAll('.error-border').forEach(el => {
        el.classList.remove('error-border');
    });

    if (!nombreRubrica) {
        Swal.fire('Error', 'El nombre de la rúbrica es obligatorio', 'error');
        document.getElementById('nombreRubrica').classList.add('error-border');
        return;
    }

    if (!tipoRubrica) {
        Swal.fire('Error', 'Debe seleccionar un tipo de Rúbrica', 'error');
        document.getElementById('tipoRubrica').classList.add('error-border');
        return;
    }

    if (!instrucciones) {
        Swal.fire('Error', 'Las instrucciones son obligatorias', 'error');
        document.getElementById('instrucciones').classList.add('error-border');
        return;
    }

    if (!idEval) {
        Swal.fire('Error', 'Debe seleccionar una evaluación', 'error');
        document.getElementById('evaluacion').classList.add('error-border');
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
        id_evaluacion: idEval,
        tipo_rubrica: tipoRubrica,
        instrucciones: instrucciones,
        porcentaje: porcentaje,
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
    
    const datosParaEnviar = {
        nombre_rubrica: rubricaData.nombre_rubrica,
        id_evaluacion: rubricaData.id_evaluacion,
        tipo_rubrica: rubricaData.tipo_rubrica,
        instrucciones: rubricaData.instrucciones,
        porcentaje: rubricaData.porcentaje,
        criterios: JSON.stringify(rubricaData.criterios) // <-- ya viene stringified
    };
    
    try {
        // ============================================================
        // ENVÍO CON FETCH
        // ============================================================
        
        const response = await fetch('/envioRubrica', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosParaEnviar)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Éxito
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                html: `
                    ${result.mensaje}<br>
                    <small>ID: ${result.rubricaId}</small><br>
                    <small>Criterios: ${result.datos.criterios} | Puntaje total: ${result.datos.sumaPuntajes}/${result.datos.porcentaje}</small>
                `
            }).then(() => {
                window.location.href = '/admin/rubricas';
            });
        } else {
            // Error controlado del servidor
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.mensaje
            });
            
            // Resaltar campo específico si viene en la respuesta
            if (result.campo) {
                const elemento = document.querySelector(`[name="${result.campo}"], #${result.campo}`);
                if (elemento) {
                    elemento.classList.add('error-border');
                    elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor. Verifique su conexión.'
        });
    }
});
}