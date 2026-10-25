# Prompt de implementación: landing page de StudyZen

Actúa como responsable de diseño e implementación frontend dentro del repositorio StudyZen. Diseña e implementa una landing page de calidad para presentar el proyecto desde un portfolio personal. Este documento contiene el brief aprobado, los hechos comprobados del producto y las restricciones que debes respetar. Úsalo como fuente de requisitos; no rellenes los datos desconocidos con suposiciones.

## Objetivo del encargo

Crear desde cero —en el sentido de replantear la presentación visual, no de ignorar la aplicación existente— una landing page en la ruta `/` que permita a alguien que llega desde el portfolio:

1. Entender rápidamente qué es StudyZen y cómo ayuda a organizar el estudio.
2. Explorar el producto mediante una galería interactiva de capturas reales.
3. Abrir el flujo de la aplicación con la acción principal **Get started**, que navega a `/timer`.
4. Visitar el repositorio del proyecto desde un enlace visible a GitHub.

La landing es ante todo una presentación del proyecto de portfolio. No es una página de venta, una oferta comercial ni una promesa de resultados académicos. La acción principal acordada es **Get started** → `/timer`.

## Audiencia y mensaje

- Audiencia principal: personas que llegan desde una sección de proyectos de un portfolio y quieren conocer el proyecto y ver cómo funciona.
- El mensaje principal debe centrarse en la utilidad de StudyZen para organizar el estudio.
- No se ha definido un perfil demográfico, etapa académica o problema más específico. No inventes uno ni escribas copy que dé a entender que StudyZen está dirigido exclusivamente a un grupo concreto.
- El sitio puede describir funciones reales con lenguaje sencillo y centrado en la persona que estudia.
- Todo el texto visible de la interfaz debe estar en inglés, incluidos botones, títulos, descripciones, labels accesibles, textos alternativos, mensajes y metadatos visibles de la página.

## Requisitos expresos del header

El header debe contener:

- La marca StudyZen.
- Un selector de modo claro/oscuro representado solo por un icono de sol o luna, sin texto visible. El control debe tener un nombre accesible en inglés, estado y foco visibles, y funcionar con teclado.
- Un enlace al repositorio: `https://github.com/frandm16/StudyZen`.
- Un botón **Get started** que lleve a `/timer`.

No sustituyas ni desplaces estas acciones sin una razón funcional clara. El enlace al repositorio puede abrir una pestaña nueva con los atributos de seguridad apropiados y debe informar de ello a tecnologías de asistencia.

## Hechos del producto que puedes utilizar

El README del repositorio describe StudyZen como una plataforma de estudio autoalojada para planificar trabajo, registrar sesiones de concentración y revisar el progreso. La arquitectura incluye una aplicación React web, API Spring Boot y PostgreSQL.

Las funciones documentadas y/o comprobadas en la aplicación incluyen:

- Temporizadores Pomodoro, cuenta atrás y cronómetro.
- Sesiones de estudio que pueden guardarse con notas y una valoración de concentración.
- Organización de asignaturas, temas, periodos académicos, evaluaciones y notas.
- Planificación diaria y semanal.
- Sesiones de estudio programadas, fechas límite, tareas pendientes y objetivos de estudio.
- Historial de sesiones, estadísticas, actividad y resúmenes de progreso.
- Ajustes de cuenta, temas de color y sonidos configurables para el temporizador.

Limita el copy a capacidades comprobadas. Puedes agrupar funciones relacionadas para que la página sea fácil de escanear, pero no afirmes que el producto automatiza, recomienda, predice, sincroniza o integra cosas que no estén confirmadas en el código y la documentación.

### Limitación importante del CTA

La ruta `/timer` está protegida por autenticación. Si una persona no ha iniciado sesión, la aplicación la redirige a `/login`. Esta conducta es deliberada y aceptada para el CTA: mantén el destino `/timer` y no lo cambies a `/login` o `/register`.

## Evidencia, capturas y copy: límites estrictos

- No se han proporcionado testimonios verificables, cifras representativas, logos de clientes, estudios de caso, métricas de uso ni garantías. No inventes ninguno ni añadas placeholders que parezcan reales.
- Las capturas disponibles son imágenes de la interfaz. Algunas enseñan datos de demostración, como nombres de asignaturas, minutos, sesiones, calificaciones y fechas. Preséntalas como vistas de la aplicación, no como métricas reales del proyecto ni resultados de usuarios.
- No afirmes precios, planes, disponibilidad de un servicio público, alojamiento gestionado, periodos de prueba, política de cancelación o que la aplicación sea gratis. El carácter autoalojado sí está documentado, pero no implica ninguna de esas afirmaciones.
- No añadas un FAQ de relleno, bloques de prueba social ficticios, barras de logos, cifras destacadas o claims de conversión sin una razón sustentada en información real.
- Puedes explicar de forma neutral que `/timer` conduce al flujo de inicio de sesión cuando no hay sesión, si resulta necesario para evitar sorpresa; no presentes la autenticación como registro gratuito ni como una oferta.

## Dirección visual aprobada

El usuario aprobó esta dirección:

- Presentación de producto cuidada y clara, apropiada para un proyecto de portfolio.
- La interfaz real y sus capturas son protagonistas.
- El texto explica la utilidad para organizar el estudio, sin grandilocuencia de marketing.
- Incluir una galería interactiva de capturas.
- Respetar el tema y las paletas que StudyZen ya utiliza. No crear un sistema de color ajeno o un tema de landing aislado.
- Mantener una composición responsive, accesible y coherente con el lenguaje visual existente de StudyZen: superficies calmadas, formas redondeadas con moderación, tipografía clara y acento derivado del tema activo.

La estructura de alto nivel aprobada para orientar el trabajo es:

1. Header con marca, control de tema, GitHub y **Get started**.
2. Hero con una descripción concisa de la utilidad de StudyZen y CTA a `/timer`.
3. Galería interactiva con capturas auténticas de la aplicación.
4. Recorrido compacto por funciones existentes, como enfoque, asignaturas, planificación y seguimiento.
5. Cierre con CTA a `/timer` y enlace a GitHub.

La estructura no exige copiar literalmente los encabezados anteriores ni añadir secciones de marketing estándar. Haz solo las secciones que ayuden a explicar el proyecto.

## Recursos visuales conocidos

En la raíz del repositorio se encontraron estos recursos bajo `images/`:

- `Timer-LightMode.png`
- `Timer-Running-LightMode.png`
- `Timer-Running-DarkMode.png`
- `Daily-LightMode.png`
- `Daily-DarkMode.png`
- `Weekly-LightMode.png`
- `Weekly-DarkMode.png`
- `Planning-LightMode.png`
- `Planning-DarkMode.png`
- `Subjects-LightMode.png`
- `Subjects-DarkMode.png`
- `Stats-LightMode.png`
- `Stats-DarkMode.png`
- También existen imágenes antiguas bajo `images/old/`; no las uses

Inspecciona las imágenes antes de decidir cuáles destacar y confirma las rutas existentes en el repositorio. No supongas que los demás archivos de `images/` ya están disponibles públicamente dentro de Vite. Si hace falta incorporar una imagen adicional, hazlo únicamente dentro de `frontend-web/`, verifica su procedencia y añade un texto alternativo que describa la captura sin convertir los datos de ejemplo en claims.

## Comportamiento del tema

StudyZen ya proporciona `ThemeContext` (`frontend-web/src/context/ThemeContext.tsx`):

- El modo inicial es oscuro y el tema inicial es `default` cuando no hay preferencia persistida.
- Hay modos claro/oscuro y varias paletas (`default`, `glacier`, `dusk`, `fern`, `blaze`, `solar`, `sakura`, `mocha`).
- Los colores activos se aplican como propiedades CSS del documento, por ejemplo `--app-bg`, `--app-card-bg`, `--app-card-hover`, `--app-text`, `--app-text-muted`, `--app-border` y `--accent-color`.
- El contexto ofrece `colorMode`, `colorTheme`, `toggleColorMode`, `preset` y `currentColors`.

El selector de tema de la landing debe respetar el estado global de StudyZen y las preferencias de modo/paleta. No debe mantener un estado de tema independiente, sobrescribir tokens con colores fijos, restablecer la paleta a `default` al alternar el modo ni basarse exclusivamente en `prefers-color-scheme` ignorando las preferencias de StudyZen. Utiliza los tokens compartidos y revisa cómo se aplican actualmente.

## Estructura de la aplicación y rutas conocidas

- La aplicación web activa es `frontend-web/`; no trabajes en el frontend legado.
- `frontend-web/src/App.tsx` monta la landing en `/` y excluye `/` de la navbar de la aplicación.
- La aplicación global usa React Router, `ThemeProvider`, `AuthProvider` y otros contextos.
- `frontend-web/src/pages/LandingPage.tsx` es la página que se debe revisar antes de modificar.
- `frontend-web/src/components/navbar/NavbarIcons.tsx` exporta el componente `Logo` que puede reutilizarse si sigue siendo apropiado.
- El contenedor de `App.tsx` usa un layout de altura de pantalla y `main` con overflow; comprueba estas restricciones al hacer que la página pueda desplazarse verticalmente sin crear scroll horizontal ni recortar su contenido.
- Revisa también `frontend-web/src/index.css`, el contexto de tema, el router, los componentes cercanos, los recursos de imagen y cualquier patrón UI útil antes de implementar.
- Revisa `AGENTS.md` y las instrucciones específicas del repositorio antes de empezar. Son la fuente de verdad para convenciones y verificación.

## Estado preexistente del repositorio y protección de cambios

El estado Git mostrado al inicio de la tarea anterior indicaba un cambio local en `frontend-web/src/pages/LandingPage.tsx`. No asumas que una diferencia local es tuya. Antes de cualquier edición:

1. Inspecciona `git status` y `git diff`.
2. Revisa el contenido actual de la página y determina qué es trabajo preexistente.
3. Conserva cambios del usuario; nunca los sobrescribas para hacer coincidir una versión de `HEAD`.
4. No uses `git checkout`, `git restore`, `git reset`, limpieza de stash ni comandos equivalentes para eliminar trabajo.
5. Trabaja solo en los archivos mínimos necesarios bajo `frontend-web/`.

Si aparece un conflicto entre el contenido actual y el brief que no puedas resolver de forma segura, consulta al usuario antes de reemplazarlo.

## Requisitos de implementación

- Trabaja únicamente dentro de `frontend-web/`.
- Usa React, TypeScript estricto, React Router, Tailwind CSS 4 y Lucide si encajan con los patrones existentes.
- Sigue la descomposición y convenciones actuales; no conviertas la página en un componente monolítico innecesariamente grande.
- No añadas comentarios de código.
- No cambies servicios, lógica de autenticación, rutas de producto ni APIs para resolver una necesidad puramente visual de la landing.
- No añadas dependencias sin una necesidad clara.
- Usa textos e imágenes en inglés y con nombres claros; no añadas contenido placeholder ficticio.
- No alteres rutas, claves de almacenamiento o semántica del tema compartido.
- Conserva los datos reales de las capturas, pero descríbelas únicamente como pantallas de la aplicación.
- No edites ni muevas la carpeta raíz `images/`; cualquier recurso requerido por la web debe quedar en `frontend-web/`.

## Accesibilidad y comportamiento responsive

- Usa estructura semántica y una jerarquía lógica de encabezados.
- Todos los controles deben funcionar con teclado y tener foco visible de alto contraste en los temas/paletas disponibles.
- El control de tema es icon-only a nivel visual, pero debe tener `aria-label` comprensible y actualizado (por ejemplo, anunciar el modo al que cambia), además de un `title` útil si corresponde. Los iconos decorativos deben ocultarse a lectores de pantalla.
- Implementa la galería con semántica adecuada. Si utilizas tabs ARIA, implementa correctamente selección, panel asociado, foco roving y flechas del teclado; de lo contrario, prefiere controles nativos sencillos.
- Cada captura requiere un `alt` útil. No repitas la descripción larga en el alt ni conviertas datos de muestra en afirmaciones.
- Comprueba contraste con cada tema claro/oscuro y acentos existentes; el color no debe ser el único indicador de selección.
- Respeta `prefers-reduced-motion`; evita movimiento autónomo o animaciones innecesarias y desactiva transiciones no esenciales cuando se solicite.
- La página debe funcionar con viewport estrecho, ampliación de texto y nombres largos. Sin overflow horizontal. Las capturas deben escalar conservando su proporción.
- Mantén orden de lectura y de foco igual al orden visual. Los enlaces externos deben comunicar que se abren en otra pestaña.
- El contenido de la landing debe permitir selección de texto aunque exista un `select-none` en un contenedor padre global.

## Copy y contenido sugeridos

El usuario aprobó el mensaje «la utilidad de StudyZen para organizar el estudio», no una frase de marca definitiva. Escribe copy original en inglés, conciso, concreto y respaldado por las funciones reales. Como orientación de significado, la página puede transmitir que StudyZen reúne el temporizador, las asignaturas, los planes de estudio y el seguimiento del progreso en un espacio. No es obligatorio usar esa frase literalmente.

Las pestañas o controles de la galería pueden nombrar pantallas reales, como **Focus timer**, **Subjects**, **Planning**, **Daily plan**, **Weekly plan** o **Study stats**, si los recursos utilizados están presentes. Elige una cantidad razonable que mantenga la interacción simple en móvil. Si se muestran capturas con variantes claro/oscuro, usa la variante correspondiente al tema activo cuando esté disponible.

No escribas una secuencia de pasos como si fuera el flujo obligatorio del producto, a menos que el código confirme que es así. No llames «AI planner» a una capacidad disponible: el código de planificación semanal revisado muestra un placeholder de una actualización futura y señala que todavía no está disponible.

## Verificación y entrega

1. Revisa la página, rutas, contexto de tema, CSS global, componentes cercanos, instrucciones `AGENTS.md` y recursos antes de editar.
2. Implementa la dirección aprobada con el cambio mínimo necesario.
3. Ejecuta `npm run build` desde `frontend-web/` y reporta fielmente el resultado, incluidos avisos relevantes o fallos.
4. Inspecciona `git diff --check`, `git diff` y `git status` para confirmar el alcance y que no se perdieron cambios ajenos.
5. Informa de archivos cambiados, comportamiento visible, accesibilidad/temas comprobados y resultados de build.
6. No hagas commits, pushes, PRs, publicaciones, ni cambios en ramas o historial Git. Incluye un mensaje de commit sugerido en la respuesta, pero no lo ejecutes.

## Preguntas: solo si aparece una decisión no resuelta

El usuario ya aprobó la dirección y ha decidido:

- Audiencia principal: visitantes procedentes de su portfolio.
- Mensaje: utilidad de StudyZen para organizar el estudio.
- Presentación del producto: galería interactiva de capturas.
- Acción: **Get started** va a `/timer`, aceptando que visitantes sin sesión sean redirigidos al login.
- Apariencia: respetar los temas y la paleta predeterminados/activos de StudyZen.
- Idioma visible: inglés.

No vuelvas a preguntar esas decisiones. No inventes otras preferencias. Si durante la inspección surge una decisión de UI/UX que no puede resolverse con las convenciones del proyecto o con este brief, pregunta de forma concreta antes de tomarla. En lo demás, aplica el criterio profesional más sencillo que respete lo aprobado.
