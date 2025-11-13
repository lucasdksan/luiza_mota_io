/**
 * VTEX Checkout 6 Custom - Estrutura Flexível
 * @version 1.0.0
 * @author Luiza Mota IO
 */

const CartCustomPlugin = {
    name: "cartCustom",
    version: "1.0.0",
    config: {
        cartSelector: ".container-cart .checkout-container",
        summarySelector: ".orderform-template .cart-fixed",
        frontContainer: ".front-container",
        summaryTemplate: "#react-template-summary",
    },
    state: {
        accordions: new Map(),
        lastCleanup: 0,
        spaMode: true,
    },
    init: async function (retryCount = 0) {
        const maxRetries = 5;
        const retryDelay = 2000;

        try {
            console.log(
                `[CartCustomPlugin] Inicializando versão ${this.version} (tentativa ${retryCount + 1
                })`
            );

            // Verifica se todas as dependências estão disponíveis
            if (!this.checkDependencies()) {
                console.error(
                    "[CartCustomPlugin] Dependências não encontradas, abortando inicialização"
                );
                return;
            }

            // Configura acesso ao elementObserver
            this.elementObserver = window.checkoutCustom.utils.elementObserver;

            this.updateStepInterface(window.checkoutCustom.getCurrentPage());

            // Configura event listeners
            this.setupEventListeners();

            // Aguarda orderForm estar disponível no CheckoutCustom
            await this.waitForOrderForm();

            // Atualiza estado inicial
            this.updateCartState();

            if (window.checkoutCustom.getCurrentPage() === "cart") {
                // Configura interface do carrinho (agora assíncrono)
                await this.setupCartInterface();
            } else {
                // Configura interface do resumo do pedido
                // await this.SetSummaryInterface();
            }

            // Configura listeners do ícone do carrinho
            this.setupCartIconListeners();

            // Adiciona hooks personalizados
            this.setupHooks();

            // Configura limpeza periódica para SPAs
            this.safeExecute(this.setupSPACleanup, this);

            // Configura funcionalidades específicas para mobile
            this.safeExecute(this.setupMobileFeatures, this);

            checkoutCustom.utils.log(
                "[CartCustomPlugin] Inicialização completa com sucesso"
            );
        } catch (error) {
            console.error(
                `[CartCustomPlugin] Erro na inicialização (tentativa ${retryCount + 1
                }):`,
                error
            );

            if (retryCount < maxRetries) {
                console.log(
                    `[CartCustomPlugin] Tentando reinicializar em ${retryDelay}ms...`
                );
                setTimeout(() => {
                    this.init(retryCount + 1);
                }, retryDelay);
            } else {
                console.error(
                    "[CartCustomPlugin] Falhou na inicialização após todas as tentativas"
                );
                this.setupBasicFunctionality();
            }
        }
    },

    /**
     * Método utilitário para executar funções com contexto seguro
     */
    safeExecute: function (fn, context = this, ...args) {
        try {
            if (typeof fn === "function") {
                return fn.apply(context, args);
            } else {
                console.error(
                    "[CartCustomPlugin] Função inválida passada para safeExecute"
                );
                return false;
            }
        } catch (error) {
            console.error("[CartCustomPlugin] Erro em safeExecute:", error);
            return false;
        }
    },

    /**
     * Verifica se todas as dependências necessárias estão disponíveis
     */
    checkDependencies: function () {
        const dependencies = [
            {
                name: "checkoutCustom",
                check: () => typeof window !== "undefined" && window.checkoutCustom,
                message: "Objeto global checkoutCustom não encontrado",
            },
            {
                name: "checkoutCustom.utils",
                check: () => window.checkoutCustom && window.checkoutCustom.utils,
                message: "Objeto utils do checkoutCustom não encontrado",
            },
            {
                name: "elementObserver",
                check: () =>
                    window.checkoutCustom &&
                    window.checkoutCustom.utils &&
                    window.checkoutCustom.utils.elementObserver,
                message: "Sistema elementObserver não encontrado",
            },
            {
                name: "elementObserver.addPendingTask",
                check: () => {
                    const eo =
                        window.checkoutCustom &&
                        window.checkoutCustom.utils &&
                        window.checkoutCustom.utils.elementObserver;
                    return eo && typeof eo.addPendingTask === "function";
                },
                message: "Método addPendingTask do elementObserver não encontrado",
            },
        ];

        const missingDeps = dependencies.filter((dep) => !dep.check());

        if (missingDeps.length > 0) {
            console.error("[CartCustomPlugin] Dependências faltando:");
            missingDeps.forEach((dep) => {
                console.error(`  ❌ ${dep.name}: ${dep.message}`);
            });
            return false;
        }

        console.log(
            "[CartCustomPlugin] ✅ Todas as dependências verificadas com sucesso"
        );
        return true;
    },

    /**
     * Configura funcionalidades básicas em caso de falha na inicialização completa
     */
    setupBasicFunctionality: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Configurando funcionalidades básicas..."
        );

        try {
            this.setupEventListeners();

            checkoutCustom.utils.log(
                "[CartCustomPlugin] Funcionalidades básicas configuradas"
            );
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao configurar funcionalidades básicas:",
                error
            );
        }
    },

    /**
     * Aguarda o orderForm estar disponível no CheckoutCustom
     */
    waitForOrderForm: async function (timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkOrderForm = () => {
                // Primeiro verifica se CheckoutCustom está inicializado
                if (typeof checkoutCustom === "undefined") {
                    console.warn("[CartCustomPlugin] CheckoutCustom não está disponível");
                    resolve();
                    return;
                }

                // Verifica se tem o método hasOrderForm
                if (typeof checkoutCustom.hasOrderForm !== "function") {
                    console.warn("[CartCustomPlugin] Método hasOrderForm não disponível");
                    resolve();
                    return;
                }

                if (checkoutCustom.hasOrderForm()) {
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] OrderForm disponível, continuando inicialização"
                    );
                    resolve();
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    console.warn(
                        "[CartCustomPlugin] Timeout aguardando orderForm, continuando sem ele"
                    );
                    resolve(); // Resolve mesmo sem orderForm para não bloquear
                    return;
                }

                // Continua verificando
                setTimeout(checkOrderForm, 100);
            };

            checkOrderForm();
        });
    },

    /**
     * Configura funcionalidades específicas para dispositivos móveis
     */
    setupMobileFeatures: function () {
        if (!window.checkoutCustom || !window.checkoutCustom.utils) {
            console.warn(
                "[CartCustomPlugin] Utils não disponíveis para funcionalidades mobile"
            );
            return;
        }

        const deviceInfo = window.checkoutCustom.utils.getDeviceInfo();
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Informações do dispositivo:",
            deviceInfo
        );

        if (deviceInfo.isMobile) {
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Configurando funcionalidades para mobile"
            );

            // Adiciona classe CSS para mobile no body
            document.body.classList.add("checkout-mobile");

            // Configura gestos de swipe se suportado
            if (deviceInfo.hasTouchScreen) {
                this.setupTouchGestures();
            }

            // Otimiza interface para telas pequenas
            this.optimizeMobileInterface();
        } else if (deviceInfo.isTablet) {
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Configurando funcionalidades para tablet"
            );
            document.body.classList.add("checkout-tablet");
        } else {
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Configurando funcionalidades para desktop"
            );
            document.body.classList.add("checkout-desktop");
        }
    },

    /**
     * Configura gestos de toque para mobile
     */
    setupTouchGestures: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Configurando gestos de toque..."
        );

        // Adiciona listener para swipe no carrinho
        const cartContainer = document.querySelector(this.config.cartSelector);
        if (cartContainer) {
            let startX = 0;
            let startY = 0;

            cartContainer.addEventListener(
                "touchstart",
                (e) => {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                },
                { passive: true }
            );

            cartContainer.addEventListener(
                "touchend",
                (e) => {
                    if (!startX || !startY) return;

                    const endX = e.changedTouches[0].clientX;
                    const endY = e.changedTouches[0].clientY;
                    const diffX = startX - endX;
                    const diffY = startY - endY;

                    // Detecta swipe horizontal (mais significativo que vertical)
                    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                        if (diffX > 0) {
                            checkoutCustom.utils.log(
                                "[CartCustomPlugin] Swipe para esquerda detectado"
                            );
                            // Pode implementar funcionalidade de swipe para esquerda
                        } else {
                            checkoutCustom.utils.log(
                                "[CartCustomPlugin] Swipe para direita detectado"
                            );
                            // Pode implementar funcionalidade de swipe para direita
                        }
                    }

                    startX = 0;
                    startY = 0;
                },
                { passive: true }
            );
        }
    },

    /**
     * Otimiza interface para dispositivos móveis
     */
    optimizeMobileInterface: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Otimizando interface para mobile..."
        );

        // Adiciona viewport meta tag se não existir
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement("meta");
            viewport.name = "viewport";
            viewport.content =
                "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
            document.head.appendChild(viewport);
        }

        // Ajusta comportamentos de scroll
        const cartContainer = document.querySelector(this.config.cartSelector);
        if (cartContainer) {
            cartContainer.style.overflowX = "hidden";
            cartContainer.style.WebkitOverflowScrolling = "touch";
        }

        // Melhora acessibilidade em mobile
        this.improveMobileAccessibility();
    },

    /**
     * Melhora acessibilidade para dispositivos móveis
     */
    improveMobileAccessibility: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Melhorando acessibilidade mobile..."
        );

        // Adiciona listeners para melhorar navegação por teclado em mobile
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        focusableElements.forEach((element) => {
            element.addEventListener("focus", () => {
                // Scroll suave para elemento focado
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            });
        });

        // Adiciona listener para mudanças de orientação
        window.addEventListener("orientationchange", () => {
            setTimeout(() => {
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] Orientação alterada, ajustando interface..."
                );
                this.handleOrientationChange();
            }, 500);
        });
    },

    /**
     * Trata mudanças de orientação do dispositivo
     */
    handleOrientationChange: function () {
        // Reajusta elementos após mudança de orientação
        const deviceInfo = window.checkoutCustom.utils.getDeviceInfo();
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Nova orientação - Largura:",
            deviceInfo.screenWidth
        );

        // Reaplica otimizações se necessário
        if (deviceInfo.isMobile) {
            this.optimizeMobileInterface();
        }

        // Atualiza interface do carrinho se necessário
        setTimeout(() => {
            this.updateCartInterface();
        }, 300);
    },

    /**
     * Configura os event listeners do plugin
     */
    setupEventListeners: function () {
        // Escuta mudanças no orderForm
        checkoutCustom.on("checkoutCustom:orderFormUpdate", (orderForm) => {
            console.log(
                "[CartCustomPlugin] OrderForm atualizado, atualizando interface..."
            );
            if (this.config.autoUpdate) {
                this.updateCartState();
                this.updateCartInterface();
                // this.updateSummaryInterface();
                // Atualiza também o botão de compra flutuante com os novos valores
                this.createFloatingBuyButton();
            }
        });

        // Escuta mudanças de página
        checkoutCustom.on("checkoutCustom:pageChange", (data) => {
            this.handlePageChange(data);
        });
    },
    /**
     * Configura listeners para o ícone do carrinho
     */
    setupCartIconListeners: function () {
        console.log(
            "[CartCustomPlugin] Configurando listeners do ícone do carrinho..."
        );

        try {
            // Procura por elementos que podem ser ícones do carrinho
            const cartIcons = document.querySelectorAll(
                "[data-cart-icon], .cart-icon, .minicart-icon"
            );

            cartIcons.forEach((icon, index) => {
                // Remove listeners existentes para evitar duplicatas
                icon.removeEventListener("click", this.handleCartIconClick);
                icon.removeEventListener("keydown", this.handleCartIconKeydown);

                // Adiciona novos listeners
                icon.addEventListener("click", (event) => {
                    this.handleCartIconClick(event, index);
                });

                icon.addEventListener("keydown", (event) => {
                    this.handleCartIconKeydown(event, index);
                });

                // Adiciona atributos de acessibilidade
                if (!icon.hasAttribute("aria-label")) {
                    icon.setAttribute("aria-label", "Abrir carrinho de compras");
                }
                if (!icon.hasAttribute("role")) {
                    icon.setAttribute("role", "button");
                }
                if (!icon.hasAttribute("tabindex")) {
                    icon.setAttribute("tabindex", "0");
                }
            });

            console.log(
                `[CartCustomPlugin] ${cartIcons.length} ícones de carrinho configurados`
            );
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Erro ao configurar listeners do ícone:",
                error.message
            );
            this.logError("setupCartIconListeners", error);
        }
    },

    /**
     * Manipula clique no ícone do carrinho
     */
    handleCartIconClick: function (event, index) {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Ícone do carrinho clicado:",
            index
        );

        try {
            event.preventDefault();

            // Toggle do carrinho
            this.toggleCartVisibility();
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao manipular clique no ícone:",
                error
            );
            this.logError("handleCartIconClick", error, { index });
        }
    },

    /**
     * Manipula eventos de teclado no ícone do carrinho
     */
    handleCartIconKeydown: function (event, index) {
        // Suporte para Enter e Space
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.handleCartIconClick(event, index);
        }
    },

    /**
     * Alterna visibilidade do carrinho
     */
    toggleCartVisibility: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Alternando visibilidade do carrinho"
        );

        try {
            const cartContainer = document.querySelector(this.config.cartSelector);
            if (cartContainer) {
                const isVisible = cartContainer.style.display !== "none";
                cartContainer.style.display = isVisible ? "none" : "block";

                // Atualiza aria-expanded nos ícones
                const cartIcons = document.querySelectorAll(
                    "[data-cart-icon], .cart-icon, .minicart-icon"
                );
                cartIcons.forEach((icon) => {
                    icon.setAttribute("aria-expanded", (!isVisible).toString());
                });

                console.log(
                    `[CartCustomPlugin] Carrinho ${isVisible ? "ocultado" : "exibido"}`
                );
            }
        } catch (error) {
            console.error("[CartCustomPlugin] Erro ao alternar visibilidade:", error);
            this.logError("toggleCartVisibility", error);
        }
    },

    /**
     * Atualiza interface do passo atual
     */
    updateStepInterface: function (page) {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Atualizando interface do passo atual",
            page
        );

        if (page === "profile") {
            document.body.classList.add("body-profile");
        } else {
            document.body.classList.remove("body-profile");
        }
        if (page === "shipping") {
            document.body.classList.add("body-shipping");
        } else {
            document.body.classList.remove("body-shipping");
        }
        if (page === "payment") {
            document.body.classList.add("body-payment");
        } else {
            document.body.classList.remove("body-payment");
        }
        if (page === "confirmation") {
            document.body.classList.add("body-confirmation");
        } else {
            document.body.classList.remove("body-confirmation");
        }
        if (page === "email") {
            document.body.classList.add("body-email");
        } else {
            document.body.classList.remove("body-email");
        }
    },

    /**
     * Manipula mudanças de página
     */
    handlePageChange: function (data) {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Manipulando mudança de página:",
            data
        );

        try {
            const newPage = data.to;

            // Atualiza comportamento baseado na página atual
            switch (newPage) {
                case "profile":
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Página de perfil - carrinho pode estar limitado"
                    );
                    this.updateCartForProfilePage();
                    break;

                case "shipping":
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Página de entrega - foco em opções de frete"
                    );
                    this.updateCartForShippingPage();
                    break;

                case "payment":
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Página de pagamento - carrinho em modo leitura"
                    );
                    this.updateCartForPaymentPage();
                    break;

                case "confirmation":
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Página de confirmação - carrinho finalizado"
                    );
                    this.updateCartForConfirmationPage();
                    break;

                case "email":
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Página de email - carrinho em modo leitura"
                    );
                    this.updateCartForEmailPage();
                    break;

                default:
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Página desconhecida:",
                        newPage
                    );
                    this.updateCartInterface();
                    // this.updateSummaryInterface();
            }
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Erro ao manipular mudança de página:",
                error.message
            );
            this.logError("handlePageChange", error, data);
        }
    },

    /**
     * Atualiza carrinho para página de perfil
     */
    updateCartForProfilePage: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Atualizando para página de perfil"
        );
        // Implementações específicas para página de perfil
        this.updateCartInterface();
        // this.updateSummaryInterface();
    },

    /**
     * Atualiza carrinho para página de entrega
     */
    updateCartForShippingPage: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Atualizando para página de entrega"
        );
        // Implementações específicas para página de entrega
        this.updateCartInterface();
        // this.updateSummaryInterface();
    },

    /**
     * Atualiza carrinho para página de pagamento
     */
    updateCartForPaymentPage: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Atualizando para página de pagamento"
        );
        // Implementações específicas para página de pagamento
        this.updateCartInterface();
        // this.updateSummaryInterface();
    },

    /**
     * Atualiza carrinho para página de confirmação
     */
    updateCartForConfirmationPage: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Atualizando para página de confirmação"
        );
        // Implementações específicas para página de confirmação
        this.updateCartInterface();
        // this.updateSummaryInterface();
    },

    /**
     * Atualiza carrinho para página de email
     */
    updateCartForEmailPage: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Atualizando para página de email"
        );
    },

    /**
     * Configura hooks personalizados
     */
    setupHooks: function () {
        checkoutCustom.utils.log("[CartCustomPlugin] Configurando hooks...");

        // Verificações de segurança
        if (!checkoutCustom || typeof checkoutCustom.addHook !== "function") {
            console.warn(
                "[CartCustomPlugin] CheckoutCustom não disponível para hooks"
            );
            return;
        }

        try {
            // Hook para quando o orderForm for atualizado
            checkoutCustom.addHook(
                "onOrderFormUpdate",
                (orderForm, previousOrderForm) => {
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Hook: OrderForm atualizado"
                    );
                    try {
                        this.updateCartState();
                        this.updateCartInterface();
                        // this.updateSummaryInterface();
                    } catch (hookError) {
                        console.error(
                            "[CartCustomPlugin] Erro no hook onOrderFormUpdate:",
                            hookError
                        );
                    }
                }
            );

            // Hook para quando a página mudar
            checkoutCustom.addHook("afterPageChange", (newPage) => {
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] Hook: Página mudou para",
                    newPage
                );
                try {
                    this.handlePageChange({ to: newPage });
                    this.updateStepInterface(newPage);
                } catch (hookError) {
                    console.error(
                        "[CartCustomPlugin] Erro no hook afterPageChange:",
                        hookError
                    );
                }
            });

            // Hook para quando o plugin for destruído
            checkoutCustom.addHook("beforeDestroy", () => {
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] Hook: Plugin será destruído"
                );
                try {
                    this.destroy();
                } catch (hookError) {
                    console.error(
                        "[CartCustomPlugin] Erro no hook beforeDestroy:",
                        hookError
                    );
                }
            });

            checkoutCustom.utils.log(
                "[CartCustomPlugin] Hooks configurados com sucesso"
            );
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Erro ao configurar hooks:",
                error.message
            );
            this.logError("setupHooks", error);
        }
    },
    /**
     * Manipula o carrinho vazio
     */
    handleEmptyCart: function (items) {
        if (items.length === 0) {
            console.log("[CartCustomPlugin] Carrinho vazio", items);
            document.body.classList.add("cart-is-empty");

            const checkoutContainer = document.querySelector(".checkout-container");
            if (checkoutContainer) {
                checkoutContainer.classList.add("cart-is-empty");
            }
        } else {
            console.log("[CartCustomPlugin] Carrinho não vazio", items);
            document.body.classList.remove("cart-is-empty");

            const checkoutContainer = document.querySelector(".checkout-container");
            if (checkoutContainer) {
                checkoutContainer.classList.remove("cart-is-empty");
            }
        }
    },
    /**
     * Atualiza o estado interno do carrinho
     */
    updateCartState: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Atualizando estado interno do carrinho..."
        );

        // Obtém dados do orderForm via CheckoutCustom
        const orderForm = checkoutCustom.getOrderForm();
        if (orderForm) {
            this.state.items = orderForm.items || [];
            this.state.total = checkoutCustom.getTotal();
            this.state.shipping = orderForm.shippingData || {};
            this.state.payment = orderForm.paymentData || {};

            this.handleEmptyCart(orderForm.items);

            console.log(
                `[CartCustomPlugin] Estado atualizado: ${this.state.items.length} itens, Total: R$ ${this.state.total}`
            );
        } else {
            console.warn(
                "[CartCustomPlugin] OrderForm não disponível para atualização do estado"
            );
        }
    },

    /**
     * Atualiza a interface do resumo
     */
    updateSummaryInterface: function () {
        try {
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Atualizando interface do resumo..."
            );

            // Verifica se os elementos ainda existem
            const summaryContainer = document.querySelector(
                this.config.summarySelector
            );

            // Modifica os badges de quantidade do VTEX
            this.modifyQuantityBadges();

            const summaryTemplate = document.querySelector(
                this.config.summaryTemplate
            );

            if (!summaryContainer) {
                console.warn(
                    "[CartCustomPlugin] Container do resumo não encontrado, tentando recriar..."
                );
                this.createSummaryElements().catch((error) => {
                    console.error("[CartCustomPlugin] Erro ao recriar resumo:", error);
                });
                return;
            }

            if (!summaryTemplate) {
                console.warn(
                    "[CartCustomPlugin] SummaryTemplate não encontrado, tentando recriar..."
                );
                this.createSummary().catch((error) => {
                    console.error("[CartCustomPlugin] Erro ao recriar resumo:", error);
                });
                return;
            }

            // Sempre recria o carrinho para refletir mudanças nos itens
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Recriando resumo com dados atualizados..."
            );
            this.createSummary().catch((error) => {
                console.error("[CartCustomPlugin] Erro ao recriar cart:", error);
            });

            // Atualiza estado interno
            // this.updateSummaryState();
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Interface do resumo atualizada"
            );
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao atualizar interface do resumo:",
                error
            );
            this.logError("updateSummaryInterface", error);
        }
    },
    /**
     * Atualiza a interface do carrinho
     */
    updateCartInterface: function () {
        try {
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Atualizando interface do carrinho..."
            );

            // Limpa accordions órfãos antes de qualquer verificação
            this.cleanupOrphanedAccordions();

            // Verifica se os elementos ainda existem
            const cartContainer = document.querySelector(this.config.cartSelector);
            const frontContainer = document.querySelector(this.config.frontContainer);

            if (!cartContainer) {
                console.warn(
                    "[CartCustomPlugin] Container do carrinho não encontrado, tentando recriar..."
                );
                if (checkoutCustom.getCurrentPage() === "cart") {
                    this.createCartElements().catch((error) => {
                        console.error("[CartCustomPlugin] Erro ao recriar elementos:", error);
                    });
                }
                return;
            }

            if (!frontContainer) {
                console.warn(
                    "[CartCustomPlugin] Front-container não encontrado, tentando recriar..."
                );
                this.createCart().catch((error) => {
                    console.error("[CartCustomPlugin] Erro ao recriar cart:", error);
                });
                return;
            }

            // Sempre recria o carrinho para refletir mudanças nos itens
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Recriando carrinho com dados atualizados..."
            );
            this.createCart().catch((error) => {
                console.error("[CartCustomPlugin] Erro ao recriar cart:", error);
            });

            // Atualiza estado interno
            this.updateCartState();
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Interface do carrinho atualizada"
            );

            // Retorna early pois já recriamos o carrinho
            return;
        } catch (error) {
            console.error("[CartCustomPlugin] Erro ao atualizar interface:", error);
            this.logError("updateCartInterface", error);
        }
    },

    /**
     * Verifica saúde do plugin
     */
    healthCheck: function () {
        const health = {
            timestamp: new Date().toISOString(),
            elements: {
                cartContainer: !!document.querySelector(this.config.cartSelector),
                frontContainer: !!document.querySelector(this.config.frontContainer),
            },
            observers: {
                cartObserver: !!this.cartObserver,
            },
            state: this.state,
            version: this.version,
        };

        checkoutCustom.utils.log("[CartCustomPlugin] Health Check:", health);
        return health;
    },

    /**
     * Log estruturado de erros
     */
    logError: function (methodName, error, context = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            plugin: "CartCustomPlugin",
            version: this.version,
            method: methodName,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        console.error("[CartCustomPlugin] Error Log:", errorLog);

        // Em produção, poderia enviar para um serviço de logging
        // this.sendErrorLog(errorLog);
    },

    SetSummaryInterface: async function () {
        try {
            console.log(
                "[CartCustomPlugin] Configurando interface do resumo do pedido..."
            );
            // await this.createSummaryElements();
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao configurar interface do resumo do pedido:",
                error
            );

            throw error;
        }
    },
    /**
     * Configura a interface inicial do carrinho com sistema robusto
     */
    setupCartInterface: async function () {
        try {
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Configurando interface do carrinho..."
            );

            // Adiciona estilos CSS necessários
            this.addCartStyles();

            // Cria elementos se não existirem (agora assíncrono)
            if (checkoutCustom.getCurrentPage() === "cart") {
                await this.createCartElements();
            }

            // Configura observador contínuo para elementos dinâmicos
            this.setupContinuousObserver();

            console.log(
                "[CartCustomPlugin] Interface do carrinho configurada com sucesso"
            );
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao configurar interface do carrinho:",
                error
            );

            throw error;
        }
    },

    /**
     * Configura observador contínuo para detectar mudanças dinâmicas no DOM
     */
    setupContinuousObserver: function () {
        if (this.cartObserver) {
            this.cartObserver.disconnect();
        }

        this.cartObserver = new MutationObserver((mutations) => {
            let shouldUpdate = false;

            mutations.forEach((mutation) => {
                // Verifica se foram adicionados/removidos elementos relevantes
                if (mutation.type === "childList") {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const removedNodes = Array.from(mutation.removedNodes);

                    // Verifica se foram adicionados elementos do carrinho
                    const hasCartElements = addedNodes.some(
                        (node) =>
                            node.nodeType === Node.ELEMENT_NODE &&
                            node.matches &&
                            (node.matches(this.config.cartSelector) ||
                                (node.querySelector &&
                                    node.querySelector(this.config.cartSelector)))
                    );

                    // Verifica se foram removidos elementos do carrinho
                    const hasRemovedCartElements = removedNodes.some(
                        (node) =>
                            node.nodeType === Node.ELEMENT_NODE &&
                            node.matches &&
                            (node.matches(this.config.frontContainer) ||
                                (node.querySelector &&
                                    node.querySelector(this.config.frontContainer)))
                    );

                    if (hasCartElements || hasRemovedCartElements) {
                        shouldUpdate = true;
                    }
                }
            });

            if (shouldUpdate) {
                console.log(
                    "[CartCustomPlugin] Mudanças detectadas no DOM, atualizando interface..."
                );
                // Debounce para evitar atualizações excessivas
                clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(() => {
                    this.updateCartInterface();
                }, 300);
            }
        });

        // Observa mudanças no container do checkout
        const checkoutContainer = document.querySelector(
            checkoutCustom.config.selectors.checkoutContainer
        );
        if (checkoutContainer) {
            this.cartObserver.observe(checkoutContainer, {
                childList: true,
                subtree: true,
                attributes: false,
            });
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Observador contínuo configurado"
            );
        } else {
            console.warn(
                "[CartCustomPlugin] Container do checkout não encontrado para observação"
            );
        }
    },
    /**
     * Adiciona estilos CSS para o carrinho
     */
    addCartStyles: function () { },

    /**
     * Cria elementos do resumo do pedido
     */
    createSummaryElements: async function () {
        try {
            console.log(
                "[CartCustomPlugin] Criando elementos do resumo do pedido..."
            );

            await checkoutCustom.utils.waitForElement(
                this.config.summarySelector,
                1000
            );

            // Modifica os badges de quantidade do VTEX
            this.modifyQuantityBadges();

            const existingSummaryContainer = document.querySelector(
                this.config.summaryTemplate
            );

            if (existingSummaryContainer) {
                console.log(
                    "[CartCustomPlugin] Container do resumo do pedido já existe, pulando criação"
                );
                return true;
            }

            await this.createSummary();

            return true;
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao criar elementos do resumo do pedido:",
                error
            );
        }
    },
    /**
     * Cria elementos necessários se não existirem com sistema robusto de detecção
     */
    createCartElements: async function () {
        try {
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Verificando elementos do carrinho..."
            );

            // Primeiro, aguarda o container principal estar disponível
            await checkoutCustom.utils.waitForElement(
                this.config.cartSelector,
                3000
            );

            // Verifica se já existe um front-container
            const existingFrontContainer = document.querySelector(
                this.config.frontContainer
            );

            if (existingFrontContainer) {
                console.log(
                    "[CartCustomPlugin] Front-container já existe, pulando criação"
                );
                return true;
            }

            // Cria o cart se não existir
            console.log(
                "[CartCustomPlugin] Front-container não encontrado, criando cart..."
            );
            await this.createCart();

            return true;
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao criar elementos do cart:",
                error
            );
            // throw error;
        }
    },

    /**
     * Cria o item do cart para mobile
     */
    cartItemMobile: function (item, index, orderForm) {
        // Obtém a data de entrega formatada
        const shippingDate = orderForm ? checkoutCustom.getShippingEstimatedDate(orderForm, index) : 'A Calcular';

        // Verifica disponibilidade do item
        const isAvailable = this.checkItemAvailability(item);
        // const isAvailable = false;

        const availableAttr = isAvailable ? 'true' : 'false';

        return `
     <li data-skuid="${item?.id}" data-itemindex="${index}" data-available="${availableAttr}"
    class="front-container-item-mobile${!isAvailable ? ' unavailable-item' : ''}">
    <div class="front-container-content-mobile">
        <a class="front-container-product-image-mobile-link" href="${item?.detailUrl}">
            <img class="front-container-product-image-mobile"
                src="${window.checkoutCustom.utils.convertImageUrl(item?.imageUrl, '200-200')}" alt="">
        </a>
        <div class="front-container-product-info">
            <div class="front-container-product-info-mobile">
                <h3 class="front-container-product-name-mobile">${item?.name}</h3>
            </div>
            <div class="front-container-product-selector-quantity-mobile">
                <button type="button" class="front-container-product-selector-quantity-mobile-less">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M3.33333 8H12.6667" stroke="#484849" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </button>
                <input type="number" class="front-container-product-selector-quantity-mobile-input"
                    value="${item?.quantity}">
                <button type="button" class="front-container-product-selector-quantity-mobile-more">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M8 3.33334V12.6667" stroke="#484849" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.33333 8H12.6667" stroke="#484849" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </button>
            </div>
        </div>
        <div class="front-container-product-action">
            <div class="front-container-product-details-info-mobile">
                <button type="button" class="front-container-product-remove-mobile">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<path d="M2.06726 5H3.83008H17.9326" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.4744 4.99999V3.33332C6.4744 2.8913 6.66013 2.46737 6.99072 2.15481C7.32131 1.84225 7.76969 1.66666 8.23722 1.66666H11.7629C12.2304 1.66666 12.6788 1.84225 13.0094 2.15481C13.34 2.46737 13.5257 2.8913 13.5257 3.33332V4.99999M16.1699 4.99999V16.6667C16.1699 17.1087 15.9842 17.5326 15.6536 17.8452C15.323 18.1577 14.8746 18.3333 14.4071 18.3333H5.59299C5.12546 18.3333 4.67708 18.1577 4.34649 17.8452C4.01589 17.5326 3.83017 17.1087 3.83017 16.6667V4.99999H16.1699Z" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.23709 9.16666V14.1667" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.7629 9.16666V14.1667" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </button>
                <div class="front-container-product-price-mobile">
                        <span
                            class="front-container-product-price-mobile-value">${CheckoutCustom.formatCurrency(item?.price)}</span>
                </div>
                ${!isAvailable ? '<div class="unavailable-message"><span class="unavailable-text">Este produto não está disponível no momento.</span></div>' : ''}</div></div></div></li>`;
    },

    /**
     * Cria o Cart com sistema de espera robusto
     */
    cartItem: function (item, index, orderForm) {
        // Obtém a data de entrega formatada
        const shippingDate = orderForm ? checkoutCustom.getShippingEstimatedDate(orderForm, index) : 'A Calcular';

        // Verifica disponibilidade do item
        const isAvailable = this.checkItemAvailability(item);
        // const isAvailable = false;
        const availableAttr = isAvailable ? 'true' : 'false';

        return `
     <li data-skuid="${item?.id}" data-itemindex="${index}" data-available="${availableAttr}"
    class="front-container-item${!isAvailable ? ' unavailable-item' : ''}">
    <div class="front-container-content">
        <a class="front-container-product-image-link" href="${item?.detailUrl}">
            <img class="front-container-product-image"
                src="${window.checkoutCustom.utils.convertImageUrl(item?.imageUrl, '200-200')}" alt="">
        </a>
        <div class="front-container-product-info">
            <div class="front-container-product-info">
                <h3 class="front-container-product-name">${item?.name}</h3>
            </div>
            <div class="front-container-product-selector-quantity">
                <button type="button" class="front-container-product-selector-quantity-less">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M3.33333 8H12.6667" stroke="#484849" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </button>
                <input type="number" class="front-container-product-selector-quantity-input"
                    value="${item?.quantity}">
                <button type="button" class="front-container-product-selector-quantity-more">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M8 3.33334V12.6667" stroke="#484849" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3.33333 8H12.6667" stroke="#484849" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </button>
            </div>
        </div>
        <div class="front-container-product-action">
            <div class="front-container-product-details-info">
                <button type="button" class="front-container-product-remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<path d="M2.06726 5H3.83008H17.9326" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.4744 4.99999V3.33332C6.4744 2.8913 6.66013 2.46737 6.99072 2.15481C7.32131 1.84225 7.76969 1.66666 8.23722 1.66666H11.7629C12.2304 1.66666 12.6788 1.84225 13.0094 2.15481C13.34 2.46737 13.5257 2.8913 13.5257 3.33332V4.99999M16.1699 4.99999V16.6667C16.1699 17.1087 15.9842 17.5326 15.6536 17.8452C15.323 18.1577 14.8746 18.3333 14.4071 18.3333H5.59299C5.12546 18.3333 4.67708 18.1577 4.34649 17.8452C4.01589 17.5326 3.83017 17.1087 3.83017 16.6667V4.99999H16.1699Z" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.23709 9.16666V14.1667" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.7629 9.16666V14.1667" stroke="#858588" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </button>
                <div class="front-container-product-price">
                        <span
                            class="front-container-product-price-value">${CheckoutCustom.formatCurrency(item?.price)}</span>
                </div>
                ${!isAvailable ? '<div class="unavailable-message"><span class="unavailable-text">Este produto não está disponível no momento.</span></div>' : ''}</div></div></div></li>`;
    },

    /**
     * Cria o Summary com sistema de espera robusto
     */
    createSummary: async function (retryCount = 0) {
        const maxRetries = 3;
        const retryDelay = 1000;

        try {
            console.log(
                "[CartCustomPlugin] Criando Summary (tentativa",
                retryCount + 1,
                "de",
                maxRetries + 1,
                ")"
            );

            const summaryContainer = await checkoutCustom.utils.waitForElement(
                this.config.summarySelector,
                1000
            );

            const formatCurrency = checkoutCustom.formatCurrency.bind(checkoutCustom);
            const orderForm = checkoutCustom.getOrderForm();
            const shippingValue =
                orderForm?.totalizers?.find((totalizer) => totalizer.id === "Shipping")
                    ?.value || 0;
            const discountValue =
                orderForm?.totalizers?.find((totalizer) => totalizer.id === "Discount")
                    ?.value || 0;
            const SubTotalValue =
                orderForm?.totalizers?.find((totalizer) => totalizer.id === "Items")
                    ?.value || 0;

            const summary = document.createElement("div");
            summary.setAttribute("data-template-summary-created", "true"); // Marca como criado por nós
            summary.setAttribute("id", "react-template-summary"); // Marca como criado por nós
            summary.innerHTML = `
          <div class="float-product-summary">
            <div class="float-product-summary-item">
              <span class="float-product-summary-item-title">Subtotal</span>
              <span class="float-product-summary-item-value">${formatCurrency(
                SubTotalValue
            )}</span>
            </div>
            <div class="float-product-summary-item">
              <span class="float-product-summary-item-title">Entrega</span>
              <span class="float-product-summary-item-value">${formatCurrency(
                shippingValue
            )}</span>
            </div>
            <div class="float-product-summary-item">
              <span class="float-product-summary-item-title">Descontos</span>
              <span class="float-product-summary-item-value">${formatCurrency(
                discountValue
            )}</span>
            </div>
            <div class="float-product-summary-item float-product-summary-item-total">
              <span class="float-product-summary-item-title">Total</span>
              <span class="float-product-summary-item-value">${formatCurrency(
                orderForm?.value
            )}</span>
            </div>
          </div>
        `;

            const summaryTitle = document.createElement("div");
            summaryTitle.setAttribute("data-template-title-created", "true"); // Marca como criado por nós
            summaryTitle.setAttribute("id", "react-template-title"); // Marca como criado por nós
            summaryTitle.innerHTML = `
        <div class="float-product-summary-title">
          <a href="/checkout/#/cart" class="float-product-summary-title-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17.5005 9.99998C17.5005 10.1657 17.4346 10.3247 17.3174 10.4419C17.2002 10.5591 17.0413 10.625 16.8755 10.625H4.63409L9.19268 15.1828C9.25075 15.2409 9.29681 15.3098 9.32824 15.3857C9.35967 15.4615 9.37584 15.5429 9.37584 15.625C9.37584 15.7071 9.35967 15.7884 9.32824 15.8643C9.29681 15.9402 9.25075 16.0091 9.19268 16.0672C9.13461 16.1252 9.06567 16.1713 8.9898 16.2027C8.91393 16.2342 8.83261 16.2503 8.75049 16.2503C8.66837 16.2503 8.58705 16.2342 8.51118 16.2027C8.43531 16.1713 8.36637 16.1252 8.3083 16.0672L2.6833 10.4422C2.62519 10.3841 2.57909 10.3152 2.54764 10.2393C2.51619 10.1634 2.5 10.0821 2.5 9.99998C2.5 9.91785 2.51619 9.83652 2.54764 9.76064C2.57909 9.68477 2.62519 9.61584 2.6833 9.55779L8.3083 3.93279C8.42558 3.81552 8.58464 3.74963 8.75049 3.74963C8.91634 3.74963 9.0754 3.81552 9.19268 3.93279C9.30996 4.05007 9.37584 4.20913 9.37584 4.37498C9.37584 4.54083 9.30996 4.69989 9.19268 4.81717L4.63409 9.37498H16.8755C17.0413 9.37498 17.2002 9.44083 17.3174 9.55804C17.4346 9.67525 17.5005 9.83422 17.5005 9.99998Z" fill="#4A4A4A"/>
            </svg>
          Voltar para o carrinho</a>
          <h3 class="float-product-summary-title-text">Resumo do pedido</h3>
          <span class="float-product-summary-title-count">(1 Produto)</span>
        </div>
        `;

            // Modifica os badges de quantidade do VTEX
            this.modifyQuantityBadges();

            // Remove carrinho anterior se existir para evitar duplicatas
            const existingSummary = summaryContainer.querySelector(
                "#react-template-summary"
            );
            if (existingSummary) {
                summaryContainer.removeChild(existingSummary);
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] Summary anterior removido"
                );
            }

            const paymentConfirmationWrap = summaryContainer.querySelector(
                ".payment-confirmation-wrap"
            );

            const existingSummaryTitle = summaryContainer.querySelector(
                "#react-template-title"
            );
            if (existingSummaryTitle) {
                summaryContainer.removeChild(existingSummaryTitle);
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] SummaryTitle anterior removido"
                );
            }

            // Insere o cart no container correto
            summaryContainer.prepend(summaryTitle);

            if (paymentConfirmationWrap) {
                paymentConfirmationWrap.before(summary);
            }

            checkoutCustom.utils.log("[CartCustomPlugin] Cart criado com sucesso");
        } catch (error) {
            console.error("[CartCustomPlugin] Erro ao criar Summary:", error);

            if (retryCount < maxRetries) {
                console.log(
                    `[CartCustomPlugin] Tentando novamente em ${retryDelay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                return this.createSummary(retryCount + 1);
            } else {
                console.error(
                    "[CartCustomPlugin] Falhou ao criar Summary após todas as tentativas"
                );
                throw error;
            }
        }
    },
    /**
     * Cria o Cart com sistema de espera robusto
     */
    createCart: async function (retryCount = 0) {
        const maxRetries = 3;
        const retryDelay = 1000;

        try {
            console.log(
                "[CartCustomPlugin] Criando Cart (tentativa",
                retryCount + 1,
                "de",
                maxRetries + 1,
                ")"
            );

            // Aguarda o container do carrinho estar disponível
            const cartContainer = await checkoutCustom.utils.waitForElement(
                this.config.cartSelector,
                5000
            );

            const orderForm = checkoutCustom.getOrderForm();
            const items = orderForm.items;
            const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
            const isMobile = checkoutCustom.utils.isMobile();

            const itemsHtml = items
                .map((item, index) =>
                    this.cartItemMobile(item, index, orderForm)
                )
                .join("");

            // Cria o elemento do cart
            const cart = document.createElement("div");
            cart.setAttribute("data-cart-custom-created", "true"); // Marca como criado por nós
            cart.setAttribute("class", "front-container"); // Marca como criado por nós
            cart.innerHTML = `
        <div id="react-products" style="display: ${isMobile ? 'block' : 'none'}">
          <div class="sc-hHOBiw eXgFns">
            <div class="front-container-header-container">
              <div class="front-container-header">
                <h2 class="front-container-header-title">Produto</h2>
              </div>
                <div class="front-container-header-info">
                  <span class="front-container-header-info-delivery">Entrega</span>
                  <span class="front-container-header-info-value">Valor</span>
              </div>
            </div>
            <ul class="front-container-list">
              ${items.length === 0 ? "" : itemsHtml}
            </ul>
          </div>
          </div>
          
          <div id="react-empty-cart">
            ${items.length === 0
                    ? `<div class="cart-is-empty">
                  <div class="cart-is-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="57" height="56" viewBox="0 0 57 56" fill="none"><g clip-path="url(#clip0_1051_10013)" fill="#000"><path d="M35.233 27.817a.613.613 0 01-.612-.613v-4.106a6.121 6.121 0 00-6.113-6.118c-3.37 0-6.108 2.746-6.108 6.118v4.098a.613.613 0 01-.612.612.613.613 0 01-.611-.612v-4.098c-.005-4.051 3.287-7.348 7.331-7.348 4.045 0 7.336 3.297 7.336 7.348v4.106a.613.613 0 01-.611.613z"></path><path d="M33.81 40.25H23.194c-2.047 0-2.722-1.113-3.05-1.95-1.236-3.148-3.77-13.989-3.878-14.447a.615.615 0 01.595-.755h4.606a.613.613 0 010 1.226h-3.832c.607 2.563 2.63 10.928 3.649 13.525.224.567.574 1.171 1.91 1.171h10.614c1.336 0 1.686-.604 1.91-1.17 1.02-2.598 3.038-10.963 3.65-13.526H25.445a.613.613 0 010-1.226h14.692a.613.613 0 01.595.755c-.108.458-2.642 11.3-3.878 14.446-.328.838-1.003 1.951-3.05 1.951"></path></g><defs><clipPath id="clip0_1051_10013"><path fill="#fff" transform="translate(16.25 15.75)" d="M0 0H24.5V24.5H0z"></path></clipPath></defs></svg>
                    <span class="cart-is-empty-text">Sua sacola está vazia</span>
                  </div>
                  <a href="/" type="button" class="cart-is-empty-button">
                    <span class="cart-is-empty-button-text">Continue comprando</span>
                  </a>
                </div>`
                    : ""
                }
            </div>
        </div>
        `;

            // Remove carrinho anterior se existir para evitar duplicatas
            const existingCart = cartContainer.querySelector(".front-container");
            if (existingCart) {
                cartContainer.removeChild(existingCart);
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] Carrinho anterior removido"
                );
            }

            if (window.checkoutCustom.utils.isMobile()) {
                // Insere o cart no container correto
                cartContainer.prepend(cart);
            } else {
                // Insere o cart no container correto
                cartContainer.querySelector('.cart-template .row-fluid.summary').prepend(cart);
            }

            // Adiciona o botão "Continuar Comprando" depois do cart (não dentro) apenas se não existir
            const existingContinueShopping = cartContainer.querySelector('.cart-continue-shopping');
            if (!existingContinueShopping) {
                cart.insertAdjacentHTML('afterend', `
        <div class="cart-continue-shopping">
        <a href="/" class="checkout-button secondary" onclick="checkoutCustom.emit('checkoutCustom:continueShopping')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M3.33334 8H12.6667M3.33334 8L7.33334 4M3.33334 8L7.33334 12" stroke="#FF78B0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<span>Continuar Comprando</span>
        </a>
        </div>
        `);
            }

            // Adiciona event listeners aos botões de remover
            this.addRemoveItemListeners(cart);

            // await this.createCustomSummaryAccordionInCart();

            await this.createCartMoreOptionsInfo();
            await this.createPostalCodeForgottenLink();
            await this.moveCartToOrderformLink();
            await this.moveCartLoadedDivToSummary();

            // await this.createFloatingBuyButton();
            
            return true;
        } catch (error) {
            console.warn(
                `[CartCustomPlugin] Erro ao criar cart (tentativa ${retryCount + 1}):`,
                error.message
            );

            if (retryCount < maxRetries) {
                console.log(
                    `[CartCustomPlugin] Tentando novamente em ${retryDelay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                return this.createCart(retryCount + 1);
            } else {
                console.error(
                    "[CartCustomPlugin] Falhou ao criar cart após todas as tentativas"
                );
                throw error;
            }
        }
    },

    /**
     * Modifica os badges de quantidade do VTEX de "1.00 PC" para "1"
     */
    modifyQuantityBadges: function () {
        try {
            // Procura por elementos com classe "quantity badge"
            const quantityBadges = document.querySelectorAll('.quantity.badge');

            if (quantityBadges.length === 0) {
                console.log('[CartCustomPlugin] Nenhum badge de quantidade encontrado');
                return;
            }

            quantityBadges.forEach((badge, index) => {
                try {
                    // Obtém o texto atual do badge
                    const currentText = badge.textContent || badge.innerText;

                    // Remove casas decimais e unidades (PC, UN, etc.)
                    // Exemplo: "1.00 PC" → "1", "2.00 UN" → "2", "3.00 KG" → "3"
                    // Também cobre casos como "1,00 UN" ou "1 UN"
                    const cleanQuantity = currentText
                        .replace(/\.\d+\s*\w+/i, '') // Remove ".00 PC", ".50 KG", etc.
                        .replace(/,\d+\s*\w+/i, '') // Remove ",00 UN", ",50 UN", etc.
                        .replace(/\s+\w+$/i, '') // Remove apenas unidades se não houver casas decimais
                        .trim();

                    // Atualiza o texto do badge apenas se for diferente
                    if (cleanQuantity !== currentText) {
                        badge.textContent = cleanQuantity;
                        console.log(`[CartCustomPlugin] Badge de quantidade ${index + 1} modificado: "${currentText}" → "${cleanQuantity}"`);
                    }
                } catch (error) {
                    console.error(`[CartCustomPlugin] Erro ao modificar badge de quantidade ${index + 1}:`, error);
                }
            });

            // Configura observador para mudanças futuras no DOM
            this.setupQuantityBadgeObserver();

            console.log(`[CartCustomPlugin] Modificação de ${quantityBadges.length} badges de quantidade concluída`);
        } catch (error) {
            console.error('[CartCustomPlugin] Erro ao modificar badges de quantidade:', error);
        }
    },

    /**
     * Configura observador para monitorar mudanças nos badges de quantidade
     */
    setupQuantityBadgeObserver: function () {
        try {
            // Remove observador anterior se existir
            if (this.quantityBadgeObserver) {
                this.quantityBadgeObserver.disconnect();
            }

            // Remove timeout anterior se existir
            if (this.quantityBadgeUpdateTimeout) {
                clearTimeout(this.quantityBadgeUpdateTimeout);
            }

            // Cria novo observador
            this.quantityBadgeObserver = new MutationObserver((mutations) => {
                let shouldUpdate = false;

                mutations.forEach((mutation) => {
                    // Verifica se houve mudanças em elementos com classe quantity badge
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.classList && node.classList.contains('quantity') && node.classList.contains('badge')) {
                                    shouldUpdate = true;
                                } else if (node.querySelector && node.querySelector('.quantity.badge')) {
                                    shouldUpdate = true;
                                }
                            }
                        });
                    } else if (mutation.type === 'characterData' || mutation.type === 'attributes') {
                        if (mutation.target.classList &&
                            mutation.target.classList.contains('quantity') &&
                            mutation.target.classList.contains('badge')) {
                            shouldUpdate = true;
                        }
                    }
                });

                // Aplica modificações se necessário com debounce
                if (shouldUpdate) {
                    // Cancela timeout anterior
                    if (this.quantityBadgeUpdateTimeout) {
                        clearTimeout(this.quantityBadgeUpdateTimeout);
                    }
                    // Agenda nova atualização com debounce de 150ms
                    this.quantityBadgeUpdateTimeout = setTimeout(() => {
                        this.modifyQuantityBadges();
                        this.quantityBadgeUpdateTimeout = null;
                    }, 150);
                }
            });

            // Observa mudanças no body do documento
            this.quantityBadgeObserver.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: ['class']
            });

            console.log('[CartCustomPlugin] Observador de badges de quantidade configurado');
        } catch (error) {
            console.error('[CartCustomPlugin] Erro ao configurar observador de badges:', error);
        }
    },

    /**
     * Adiciona event listeners aos botões de remover itens
     */
    addRemoveItemListeners: function (cartElement) {
        console.log("[CartCustomPlugin] Adicionando event listeners aos botões de remover itens: ", cartElement);

        const removeButtons = cartElement.querySelectorAll(
            ".front-container-product-remove"
        );

        const removeButtonsMobile = cartElement.querySelectorAll(
            ".front-container-product-remove-mobile"
        );

        removeButtonsMobile.forEach((button) => {
            button.addEventListener("click", async (event) => {
                event.preventDefault();

                // Obtém o index do item do atributo data-itemindex do elemento pai
                const listItem = button.closest(".front-container-item-mobile");
                const itemIndex = parseInt(listItem.getAttribute("data-itemindex"));

                if (isNaN(itemIndex)) {
                    console.error(
                        "[CartCustomPlugin] Não foi possível obter o index do item"
                    );
                    return;
                }

                try {
                    // Desabilita o botão durante o processamento
                    button.disabled = true;
                    button.innerHTML = "<span>Removendo...</span>";

                    // Prepara os itens para remover
                    const itemsToRemove = [
                        {
                            index: itemIndex,
                            quantity: 0, // 0 para remover completamente
                        },
                    ];

                    console.log(
                        `[CartCustomPlugin] Removendo item do index ${itemIndex}`
                    );

                    // Usa a função removeCartItem do CheckoutCustom
                    const orderForm = await window.checkoutCustom.removeCartItem(
                        itemsToRemove
                    );

                    // Feedback de sucesso
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Item removido com sucesso:",
                        orderForm
                    );

                    // Atualiza a interface do carrinho
                    if (this.updateCartInterface) {
                        await this.updateCartInterface();
                    }

                    // Atualiza imediatamente o botão de compra flutuante
                    // await this.createFloatingBuyButton();
                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao remover item:", error);
                    alert("Erro ao remover item. Tente novamente.");

                    // Reabilita o botão em caso de erro
                    button.disabled = false;
                    button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11.15 9.62503C11.3571 9.62503 11.525 9.79292 11.525 10V15.6C11.3571 15.975 11.15 15.975C10.9429 15.975 10.775 15.8071 10.775 15.6V10C10.775 9.79292 10.9429 9.62503 11.15 9.62503Z" fill="black"></path>
                <path d="M13.925 10C13.925 9.79292 13.7571 9.62503 13.55 9.62503C13.3429 9.62503 13.175 9.79292 13.175 10V15.6C13.175 15.8071 13.3429 15.975 13.55 15.975C13.7571 15.975 13.925 15.8071 13.925 15.6V10Z" fill="black"></path>
                <path d="M14.2894 7.22507H17.95C18.1571 7.22507 18.325 7.39296 18.325 7.60007C18.325 7.80717 18.1571 7.97507 17.95 7.97507H16.725V18.0001C16.725 18.2072 16.5571 18.3751 16.35 18.3751H8.34998C8.14287 18.3751 7.97498 18.2072 7.97498 18.0001V7.97507H6.75C6.54289 7.97507 6.375 7.80717 6.375 7.60007C6.375 7.39296 6.54289 7.22507 6.75 7.22507H10.4105C10.5856 6.3136 11.3874 5.625 12.3499 5.625C13.3125 5.625 14.1142 6.3136 14.2894 7.22507ZM12.3499 6.375C11.8042 6.375 11.3418 6.73191 11.1834 7.22507H13.5165C13.3581 6.73191 12.8957 6.375 12.3499 6.375ZM15.975 7.97507H8.72498V17.6251H15.975V7.97507Z" fill="black"></path>
              </svg>
            `;
                }
            });
        });

        // Event listeners para botões de quantidade móvel
        const quantityLessButtonsMobile = cartElement.querySelectorAll(
            ".front-container-product-selector-quantity-mobile-less"
        );

        const quantityMoreButtonsMobile = cartElement.querySelectorAll(
            ".front-container-product-selector-quantity-mobile-more"
        );

        // Botão de diminuir quantidade
        quantityLessButtonsMobile.forEach((button) => {
            button.addEventListener("click", async (event) => {
                event.preventDefault();

                // Obtém o index do item do atributo data-itemindex do elemento pai
                const listItem = button.closest(".front-container-item-mobile");
                const itemIndex = parseInt(listItem.getAttribute("data-itemindex"));
                const quantityInput = listItem.querySelector(".front-container-product-selector-quantity-mobile-input");
                const currentQuantity = parseInt(quantityInput.value);

                if (isNaN(itemIndex) || isNaN(currentQuantity)) {
                    console.error("[CartCustomPlugin] Não foi possível obter o index ou quantidade do item");
                    return;
                }

                // Não permite quantidade menor que 1
                if (currentQuantity <= 1) {
                    return;
                }

                const newQuantity = currentQuantity - 1;

                try {
                    // Desabilita o botão durante o processamento
                    button.disabled = true;
                    quantityInput.disabled = true;

                    checkoutCustom.utils.log(`[CartCustomPlugin] Diminuindo quantidade do item ${itemIndex} para ${newQuantity}`);

                    // Atualiza a quantidade usando a função do CheckoutCustom
                    const orderForm = await window.checkoutCustom.updateCartItemQuantity(
                        itemIndex,
                        newQuantity
                    );

                    // Atualiza o valor do input
                    quantityInput.value = newQuantity;

                    // Feedback de sucesso
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Quantidade diminuída com sucesso:",
                        orderForm
                    );

                    // Atualiza a interface do carrinho
                    if (this.updateCartInterface) {
                        await this.updateCartInterface();
                    }

                    // Atualiza imediatamente o botão de compra flutuante
                    // await this.createFloatingBuyButton();
                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao diminuir quantidade:", error);
                    alert("Erro ao alterar quantidade. Tente novamente.");

                    // Reabilita os controles em caso de erro
                    button.disabled = false;
                    quantityInput.disabled = false;
                }
            });
        });

        // Botão de aumentar quantidade
        quantityMoreButtonsMobile.forEach((button) => {
            button.addEventListener("click", async (event) => {
                event.preventDefault();

                // Obtém o index do item do atributo data-itemindex do elemento pai
                const listItem = button.closest(".front-container-item-mobile");
                const itemIndex = parseInt(listItem.getAttribute("data-itemindex"));
                const quantityInput = listItem.querySelector(".front-container-product-selector-quantity-mobile-input");
                const currentQuantity = parseInt(quantityInput.value);

                if (isNaN(itemIndex) || isNaN(currentQuantity)) {
                    console.error("[CartCustomPlugin] Não foi possível obter o index ou quantidade do item");
                    return;
                }

                const newQuantity = currentQuantity + 1;

                try {
                    // Desabilita o botão durante o processamento
                    button.disabled = true;
                    quantityInput.disabled = true;

                    checkoutCustom.utils.log(`[CartCustomPlugin] Aumentando quantidade do item ${itemIndex} para ${newQuantity}`);

                    // Atualiza a quantidade usando a função do CheckoutCustom
                    const orderForm = await window.checkoutCustom.updateCartItemQuantity(
                        itemIndex,
                        newQuantity
                    );

                    // Atualiza o valor do input
                    quantityInput.value = newQuantity;

                    // Feedback de sucesso
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Quantidade aumentada com sucesso:",
                        orderForm
                    );

                    // Atualiza a interface do carrinho
                    if (this.updateCartInterface) {
                        await this.updateCartInterface();
                    }

                    // Atualiza imediatamente o botão de compra flutuante
                    // await this.createFloatingBuyButton();
                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao aumentar quantidade:", error);
                    alert("Erro ao alterar quantidade. Tente novamente.");

                    // Reabilita os controles em caso de erro
                    button.disabled = false;
                    quantityInput.disabled = false;
                }
            });
        });

        // Event listener para alteração direta no input de quantidade
        const quantityInputsMobile = cartElement.querySelectorAll(
            ".front-container-product-selector-quantity-mobile-input"
        );

        quantityInputsMobile.forEach((input) => {
            input.addEventListener("change", async (event) => {
                const newQuantity = parseInt(event.target.value);
                const listItem = input.closest(".front-container-item-mobile");
                const itemIndex = parseInt(listItem.getAttribute("data-itemindex"));

                if (isNaN(itemIndex) || isNaN(newQuantity) || newQuantity < 1) {
                    console.error("[CartCustomPlugin] Valor de quantidade inválido");
                    // Restaura o valor anterior se inválido
                    const currentOrderForm = checkoutCustom.getOrderForm();
                    if (currentOrderForm && currentOrderForm.items && currentOrderForm.items[itemIndex]) {
                        input.value = currentOrderForm.items[itemIndex].quantity;
                    }
                    return;
                }

                try {
                    // Desabilita o input durante o processamento
                    input.disabled = true;

                    checkoutCustom.utils.log(`[CartCustomPlugin] Alterando quantidade do item ${itemIndex} para ${newQuantity}`);

                    // Atualiza a quantidade usando a função do CheckoutCustom
                    const orderForm = await window.checkoutCustom.updateCartItemQuantity(
                        itemIndex,
                        newQuantity
                    );

                    // Feedback de sucesso
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Quantidade alterada com sucesso:",
                        orderForm
                    );

                    // Atualiza a interface do carrinho
                    if (this.updateCartInterface) {
                        await this.updateCartInterface();
                    }

                    // Atualiza imediatamente o botão de compra flutuante
                    // await this.createFloatingBuyButton();
                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao alterar quantidade:", error);
                    alert("Erro ao alterar quantidade. Tente novamente.");

                    // Reabilita o input em caso de erro
                    input.disabled = false;

                    // Restaura o valor anterior
                    const currentOrderForm = checkoutCustom.getOrderForm();
                    if (currentOrderForm && currentOrderForm.items && currentOrderForm.items[itemIndex]) {
                        input.value = currentOrderForm.items[itemIndex].quantity;
                    }
                }
            });
        });

        // Event listeners para dropdown de quantidade (desktop)
        const quantityButtons = cartElement.querySelectorAll(
            ".front-container-product-quantity-button"
        );

        const quantityDropdownButtons = cartElement.querySelectorAll(
            ".front-container-product-selector-quantity-floating-button"
        );

        // Toggle dropdown ao clicar no botão principal
        quantityButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();

                // Encontra o dropdown dentro do mesmo item
                const listItem = button.closest(".front-container-item");
                const dropdown = listItem.querySelector(".front-container-product-selector-quantity-floating");

                if (dropdown) {
                    // Toggle da classe para mostrar/esconder
                    dropdown.classList.toggle("active");

                    // Fecha outros dropdowns abertos
                    cartElement.querySelectorAll(".front-container-product-selector-quantity-floating.active").forEach((activeDropdown) => {
                        if (activeDropdown !== dropdown) {
                            activeDropdown.classList.remove("active");
                        }
                    });
                }
            });
        });

        // Event listeners para botões do dropdown
        quantityDropdownButtons.forEach((button) => {
            button.addEventListener("click", async (event) => {
                event.preventDefault();

                // Obtém o valor da quantidade do texto do botão
                const quantityText = button.querySelector(".front-container-product-selector-quantity-floating-button-text");
                const newQuantity = parseInt(quantityText.textContent);

                // Encontra o item pai
                const listItem = button.closest(".front-container-item");
                const itemIndex = parseInt(listItem.getAttribute("data-itemindex"));

                // Encontra o botão principal para atualizar o texto
                const mainButton = listItem.querySelector(".front-container-product-quantity-button");
                const quantitySpan = mainButton.querySelector(".front-container-product-quantity-text");

                if (isNaN(itemIndex) || isNaN(newQuantity)) {
                    console.error("[CartCustomPlugin] Não foi possível obter o index ou quantidade do item");
                    return;
                }

                try {
                    // Desabilita o botão durante o processamento
                    button.disabled = true;
                    button.innerHTML = "<span>Alterando...</span>";

                    console.log(`[CartCustomPlugin] Alterando quantidade do item ${itemIndex} para ${newQuantity}`);

                    // Atualiza a quantidade usando a função do CheckoutCustom
                    const orderForm = await window.checkoutCustom.updateCartItemQuantity(
                        itemIndex,
                        newQuantity
                    );

                    // Atualiza o texto do botão principal
                    if (quantitySpan) {
                        quantitySpan.textContent = `Qtd: ${newQuantity}`;
                    }

                    // Fecha o dropdown
                    const dropdown = listItem.querySelector(".front-container-product-selector-quantity-floating");
                    if (dropdown) {
                        dropdown.classList.remove("active");
                    }

                    // Feedback de sucesso
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Quantidade alterada com sucesso:",
                        orderForm
                    );

                    // Atualiza a interface do carrinho
                    if (this.updateCartInterface) {
                        await this.updateCartInterface();
                    }

                    // Atualiza imediatamente o botão de compra flutuante
                    // await this.createFloatingBuyButton();
                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao alterar quantidade:", error);
                    alert("Erro ao alterar quantidade. Tente novamente.");

                    // Reabilita o botão em caso de erro
                    button.disabled = false;
                    button.innerHTML = `<span class="front-container-product-selector-quantity-floating-button-text">${newQuantity.toString().padStart(2, '0')}</span>`;
                }
            });
        });

        // Fecha dropdowns ao clicar fora
        document.addEventListener("click", (event) => {
            if (!event.target.closest(".front-container-product-quantity-button") &&
                !event.target.closest(".front-container-product-selector-quantity-floating")) {
                cartElement.querySelectorAll(".front-container-product-selector-quantity-floating.active").forEach((dropdown) => {
                    dropdown.classList.remove("active");
                });
            }
        });


        removeButtons.forEach((button) => {
            button.addEventListener("click", async (event) => {
                event.preventDefault();

                // Obtém o index do item do atributo data-itemindex do elemento pai
                const listItem = button.closest(".front-container-item");
                const itemIndex = parseInt(listItem.getAttribute("data-itemindex"));

                if (isNaN(itemIndex)) {
                    console.error(
                        "[CartCustomPlugin] Não foi possível obter o index do item"
                    );
                    return;
                }

                try {
                    // Desabilita o botão durante o processamento
                    button.disabled = true;
                    button.innerHTML = "<span>Removendo...</span>";

                    // Prepara os itens para remover
                    const itemsToRemove = [
                        {
                            index: itemIndex,
                            quantity: 0, // 0 para remover completamente
                        },
                    ];

                    console.log(
                        `[CartCustomPlugin] Removendo item do index ${itemIndex}`
                    );

                    // Usa a função removeCartItem do CheckoutCustom
                    const orderForm = await window.checkoutCustom.removeCartItem(
                        itemsToRemove
                    );

                    // Feedback de sucesso
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Item removido com sucesso:",
                        orderForm
                    );

                    // Atualiza a interface do carrinho
                    if (this.updateCartInterface) {
                        await this.updateCartInterface();
                    }

                    // Atualiza imediatamente o botão de compra flutuante
                    // await this.createFloatingBuyButton();
                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao remover item:", error);
                    alert("Erro ao remover item. Tente novamente.");

                    // Reabilita o botão em caso de erro
                    button.disabled = false;
                    button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11.15 9.62503C11.3571 9.62503 11.525 9.79292 11.525 10V15.6C11.3571 15.975 11.15 15.975C10.9429 15.975 10.775 15.8071 10.775 15.6V10C10.775 9.79292 10.9429 9.62503 11.15 9.62503Z" fill="black"></path>
                <path d="M13.925 10C13.925 9.79292 13.7571 9.62503 13.55 9.62503C13.3429 9.62503 13.175 9.79292 13.175 10V15.6C13.175 15.8071 13.3429 15.975 13.55 15.975C13.7571 15.975 13.925 15.8071 13.925 15.6V10Z" fill="black"></path>
                <path d="M14.2894 7.22507H17.95C18.1571 7.22507 18.325 7.39296 18.325 7.60007C18.325 7.80717 18.1571 7.97507 17.95 7.97507H16.725V18.0001C16.725 18.2072 16.5571 18.3751 16.35 18.3751H8.34998C8.14287 18.3751 7.97498 18.2072 7.97498 18.0001V7.97507H6.75C6.54289 7.97507 6.375 7.80717 6.375 7.60007C6.375 7.39296 6.54289 7.22507 6.75 7.22507H10.4105C10.5856 6.3136 11.3874 5.625 12.3499 5.625C13.3125 5.625 14.1142 6.3136 14.2894 7.22507ZM12.3499 6.375C11.8042 6.375 11.3418 6.73191 11.1834 7.22507H13.5165C13.3581 6.73191 12.8957 6.375 12.3499 6.375ZM15.975 7.97507H8.72498V17.6251H15.975V7.97507Z" fill="black"></path>
              </svg>
            `;
                }
            });
        });

        console.log(
            `[CartCustomPlugin] ${removeButtons.length} event listeners adicionados aos botões de remover`
        );
    },

    /**
     * Cria campo de vendedor
     */
    createCustomSellerField: async function () {
        try {
            const container = document.querySelector(
                ".summary-template-holder .cart-totalizers"
            );

            const existingSellerField = document.querySelector(
                ".summary-template-holder .custom-seller-field"
            );
            if (existingSellerField) {
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] Campo de vendedor já existe, pulando criação"
                );
                return true;
            }

            if (!container) return false;
            const form = document.createElement("form");
            form.setAttribute("class", "custom-seller-field");

            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("placeholder", "Digite o código do vendedor");
            input.setAttribute("id", "seller");
            input.setAttribute("class", "seller-value input-small");

            const button = document.createElement("button");
            button.setAttribute("type", "submit");
            button.setAttribute("class", "checkout-button secondary");
            button.innerHTML = "Ok";

            form.appendChild(input);
            form.appendChild(button);
            container.appendChild(form);

            // Adiciona event listener para submissão do formulário
            form.addEventListener("submit", async (event) => {
                event.preventDefault();

                const sellerCode = input.value.trim();
                if (!sellerCode) {
                    alert("Por favor, digite um código de vendedor válido.");
                    return;
                }

                try {
                    // Desabilita o botão durante o processamento
                    button.disabled = true;
                    button.innerHTML = "Aplicando...";

                    // Verifica código no MasterData
                    const sellerData = await this.checkSellerCode(sellerCode);

                    // Aplica campanha do vendedor
                    await this.applySellerCampaign(sellerData);

                    // Feedback de sucesso
                    alert(`Sucesso! Código do vendedor aplicado: ${sellerData.codigo} - ${sellerData.nome}`);

                    // Atualiza a interface do campo
                    this.updateSellerFieldDisplay(sellerData);

                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Código do vendedor aplicado:",
                        sellerData
                    );

                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao aplicar código do vendedor:", error);
                    alert(error.message === "Código do vendedor não encontrado" ?
                        "Código do vendedor inválido. Verifique o código e tente novamente." :
                        "Erro ao aplicar código do vendedor. Tente novamente mais tarde.");
                } finally {
                    // Reabilita o botão
                    button.disabled = false;
                    button.innerHTML = "Ok";
                }
            });

            // Verifica se já existe um código aplicado ao carregar a página
            this.loadExistingSellerCode();

            return true;
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível criar campo de vendedor:",
                error.message
            );
            return false;
        }
    },

    /**
     * Atualiza a exibição do campo de vendedor
     */
    updateSellerFieldDisplay: function (sellerData) {
        const form = document.querySelector(".custom-seller-field");
        if (!form) return;

        // Substitui o conteúdo do form por uma versão de exibição
        form.innerHTML = `
        <div class="seller-display">
          <span class="seller-info">${sellerData.codigo} - ${sellerData.nome}</span>
          <span class="seller-remove">
            <a href="javascript:void(0);" class="remove-seller-link">excluir</a>
          </span>
        </div>
      `;

        // Adiciona event listener para o link de remover
        const removeLink = form.querySelector(".remove-seller-link");
        if (removeLink) {
            removeLink.addEventListener("click", async (event) => {
                event.preventDefault();
                try {
                    await this.removeSellerCode();
                    alert("Código do vendedor removido!");

                    // Restaura o campo original
                    this.restoreSellerInputField();
                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao remover código do vendedor:", error);
                    alert("Erro ao remover código do vendedor. Tente novamente.");
                }
            });
        }
    },

    /**
     * Restaura o campo de input original do vendedor
     */
    restoreSellerInputField: function () {
        const form = document.querySelector(".custom-seller-field");
        if (!form) return;

        form.innerHTML = `
        <input type="text" placeholder="Digite o código do vendedor" id="seller" class="seller-value input-small">
        <button type="submit" class="checkout-button secondary">Ok</button>
      `;

        // Re-adiciona o event listener
        const newInput = form.querySelector("#seller");
        const newButton = form.querySelector("button");
        if (newInput && newButton) {
            form.addEventListener("submit", async (event) => {
                event.preventDefault();

                const sellerCode = newInput.value.trim();
                if (!sellerCode) {
                    alert("Por favor, digite um código de vendedor válido.");
                    return;
                }

                try {
                    // Desabilita o botão durante o processamento
                    newButton.disabled = true;
                    newButton.innerHTML = "Aplicando...";

                    // Verifica código no MasterData
                    const sellerData = await this.checkSellerCode(sellerCode);

                    // Aplica campanha do vendedor
                    await this.applySellerCampaign(sellerData);

                    // Feedback de sucesso
                    alert(`Sucesso! Código do vendedor aplicado: ${sellerData.codigo} - ${sellerData.nome}`);

                    // Atualiza a interface do campo
                    this.updateSellerFieldDisplay(sellerData);

                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Código do vendedor aplicado:",
                        sellerData
                    );

                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao aplicar código do vendedor:", error);
                    alert(error.message === "Código do vendedor não encontrado" ?
                        "Código do vendedor inválido. Verifique o código e tente novamente." :
                        "Erro ao aplicar código do vendedor. Tente novamente mais tarde.");
                } finally {
                    // Reabilita o botão
                    newButton.disabled = false;
                    newButton.innerHTML = "Ok";
                }
            });
        }
    },

    /**
     * Carrega código de vendedor existente se houver
     */
    loadExistingSellerCode: async function () {
        try {
            if (window.vtexjs && window.vtexjs.checkout && window.vtexjs.checkout.orderForm && window.vtexjs.checkout.orderForm.openTextField) {
                const openTextField = window.vtexjs.checkout.orderForm.openTextField.value;

                if (openTextField && !openTextField.includes('embalar para presente')) {
                    // Tenta extrair código e nome do openTextField
                    const parts = openTextField.split(' - ');
                    if (parts.length >= 2) {
                        const sellerData = {
                            codigo: parts[0].trim(),
                            nome: parts.slice(1).join(' - ').trim()
                        };
                        this.updateSellerFieldDisplay(sellerData);
                    }
                }
            }
        } catch (error) {
            console.warn("[CartCustomPlugin] Erro ao carregar código existente do vendedor:", error);
        }
    },
    /**
     * Verifica se um item está disponível em estoque
     */
    checkItemAvailability: function (item) {
        try {
            // Verifica se o item tem quantidade 0
            if (item?.quantity === 0) {
                return false;
            }

            // Verifica se há propriedade de disponibilidade (availability)
            if (item?.availability !== undefined && item?.availability === false) {
                return false;
            }

            // Verifica se há propriedade availableQuantity
            if (item?.availableQuantity !== undefined && item?.availableQuantity <= 0) {
                return false;
            }

            // Verifica se o item está marcado como indisponível
            if (item?.isAvailable !== undefined && item?.isAvailable === false) {
                return false;
            }

            return true;
        } catch (error) {
            console.warn("[CartCustomPlugin] Erro ao verificar disponibilidade do item:", error);
            return true; // Por padrão, assume disponível se houver erro
        }
    },

    /**
     * Aplica estilos para itens indisponíveis
     */
    applyUnavailableItemStyling: function (itemElement, isAvailable) {
        try {
            if (!isAvailable) {
                // Adiciona classe para itens indisponíveis
                itemElement.classList.add('unavailable-item');

                // Cria e adiciona mensagem de indisponibilidade
                const messageDiv = document.createElement('div');
                messageDiv.className = 'unavailable-message';
                messageDiv.innerHTML = '<span class="unavailable-text">Este produto não está disponível no momento.</span>';

                // Verifica se é mobile ou desktop para adicionar na posição correta
                if (itemElement.classList.contains('front-container-item-mobile')) {
                    // Para mobile - adiciona após os detalhes do produto
                    const detailsContainer = itemElement.querySelector('.front-container-product-details-info-mobile');
                    if (detailsContainer) {
                        detailsContainer.appendChild(messageDiv);
                    }
                } else {
                    // Para desktop - adiciona após os detalhes do produto
                    const detailsContainer = itemElement.querySelector('.front-container-product-details-info');
                    if (detailsContainer) {
                        detailsContainer.appendChild(messageDiv);
                    }
                }

                checkoutCustom.utils.log("[CartCustomPlugin] Item marcado como indisponível:", itemElement.dataset.skuid);
            }
        } catch (error) {
            console.warn("[CartCustomPlugin] Erro ao aplicar styling de item indisponível:", error);
        }
    },

    /**
     * Verifica código do vendedor no MasterData
     */
    checkSellerCode: async function (sellerCode) {
        try {
            const headers = {
                Accept: "application/vnd.vtex.ds.v10+json",
                "Content-Type": "application/json"
            };

            const response = await fetch(`/api/dataentities/VD/search?_where=CODIGO_VENDEDOR=${sellerCode}&_fields=CODIGO_VENDEDOR,NOME_VENDEDOR,UTM`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.length > 0) {
                const sellerData = {
                    codigo: data[0].CODIGO_VENDEDOR,
                    nome: data[0].NOME_VENDEDOR,
                    utm: data[0].UTM
                };
                checkoutCustom.utils.log("[CartCustomPlugin] Código do vendedor encontrado:", sellerData);
                return sellerData;
            } else {
                throw new Error("Código do vendedor não encontrado");
            }
        } catch (error) {
            console.error("[CartCustomPlugin] Erro ao verificar código do vendedor:", error);
            throw error;
        }
    },

    /**
     * Aplica campanha do vendedor via VTEX Checkout API
     */
    applySellerCampaign: async function (sellerData) {
        try {
            const { utm, codigo, nome } = sellerData;

            // Define UTM ou valor padrão
            const utmValue = utm || "cod-vendedor";

            // Prepara dados do marketingData
            let marketingData = { utmCampaign: utmValue };
            if (window.vtexjs && window.vtexjs.checkout && window.vtexjs.checkout.orderForm && window.vtexjs.checkout.orderForm.marketingData) {
                const { utmCampaign: currentCampaign, ...otherData } = window.vtexjs.checkout.orderForm.marketingData;
                marketingData = { ...otherData, ...marketingData };
            }

            // Prepara valor do openTextField
            let openTextValue = `${codigo} - ${nome}`;
            if (window.vtexjs && window.vtexjs.checkout && window.vtexjs.checkout.orderForm && window.vtexjs.checkout.orderForm.openTextField) {
                const currentValue = window.vtexjs.checkout.orderForm.openTextField.value;
                if (currentValue && currentValue.includes('embalar para presente')) {
                    openTextValue = `${codigo} - ${nome} | embalar para presente`;
                }
            }

            // Aplica marketingData
            await window.vtexjs.checkout.sendAttachment("marketingData", marketingData);

            // Aplica openTextField
            await window.vtexjs.checkout.sendAttachment("openTextField", {
                value: openTextValue
            });

            checkoutCustom.utils.log("[CartCustomPlugin] Campanha do vendedor aplicada com sucesso:", {
                marketingData,
                openTextField: openTextValue
            });

            return true;
        } catch (error) {
            console.error("[CartCustomPlugin] Erro ao aplicar campanha do vendedor:", error);
            throw error;
        }
    },

    /**
     * Remove código do vendedor
     */
    removeSellerCode: async function () {
        try {
            // Remove marketingData
            let marketingData = { utmCampaign: 'null' };
            if (window.vtexjs && window.vtexjs.checkout && window.vtexjs.checkout.orderForm && window.vtexjs.checkout.orderForm.marketingData) {
                const { utmCampaign: currentCampaign, ...otherData } = window.vtexjs.checkout.orderForm.marketingData;
                marketingData = { ...otherData, ...marketingData };
            }

            await window.vtexjs.checkout.sendAttachment("marketingData", marketingData);

            // Remove ou atualiza openTextField
            let openTextValue = null;
            if (window.vtexjs && window.vtexjs.checkout && window.vtexjs.checkout.orderForm && window.vtexjs.checkout.orderForm.openTextField) {
                const currentValue = window.vtexjs.checkout.orderForm.openTextField.value;
                if (currentValue && currentValue.includes('embalar para presente')) {
                    openTextValue = 'embalar para presente';
                }
            }

            await window.vtexjs.checkout.sendAttachment("openTextField", {
                value: openTextValue
            });

            checkoutCustom.utils.log("[CartCustomPlugin] Código do vendedor removido com sucesso");

            return true;
        } catch (error) {
            console.error("[CartCustomPlugin] Erro ao remover código do vendedor:", error);
            throw error;
        }
    },

    /**
     * Cria campo de cupom
     */
    createCustomCouponField: async function () {
        try {
            const container = document.querySelector(
                ".summary-template-holder .cart-totalizers"
            );
            const form = document.createElement("form");

            const existingCouponField = document.querySelector(
                ".summary-template-holder .custom-coupon-field"
            );
            if (existingCouponField) {
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] Campo de cupom já existe, pulando criação"
                );
                return true;
            }

            if (!container) return false;

            form.setAttribute("class", "custom-coupon-field coupon-is-empty");

            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("placeholder", "Digite seu cupom");
            input.setAttribute("id", "coupon");
            input.setAttribute("class", "coupon-value input-small");

            const button = document.createElement("button");
            button.setAttribute("type", "submit");
            button.setAttribute("class", "checkout-button secondary");
            button.innerHTML = "Ok";

            form.appendChild(input);
            form.appendChild(button);
            container.appendChild(form);

            // Adiciona event listener para submissão do formulário
            form.addEventListener("submit", async (event) => {
                event.preventDefault();

                const couponCode = input.value.trim();
                if (!couponCode) {
                    alert("Por favor, digite um código de cupom válido.");
                    return;
                }

                try {
                    // Desabilita o botão durante o processamento
                    button.disabled = true;
                    button.innerHTML = "Aplicando...";

                    // Usa a função addDiscountCoupon do CheckoutCustom
                    const orderForm = await window.checkoutCustom.addDiscountCoupon(
                        couponCode
                    );

                    // Feedback de sucesso
                    alert("Cupom aplicado com sucesso!");
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Cupom aplicado:",
                        orderForm
                    );

                    // Limpa o campo após sucesso
                    input.value = "";

                    // Atualiza a interface se necessário
                    if (this.updateCartInterface) {
                        this.updateCartInterface();
                    }
                } catch (error) {
                    console.error("[CartCustomPlugin] Erro ao aplicar cupom:", error);
                    alert("Erro ao aplicar cupom. Verifique o código e tente novamente.");
                } finally {
                    // Reabilita o botão
                    button.disabled = false;
                    button.innerHTML = "Ok";
                }
            });

            return true;
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível criar campo de cupom:",
                error.message
            );
            return false;
        }
    },
    /**
     * Cria botão de compra flutuante
     */
    createFloatingBuyButton: async function () {
        try {
            // Pequeno delay para garantir que o orderForm esteja atualizado
            await new Promise(resolve => setTimeout(resolve, 100));

            // Obtém o orderForm atual diretamente
            const currentOrderForm = checkoutCustom.getOrderForm();
            const total = currentOrderForm?.value || currentOrderForm?.totalizers?.find(t => t.id === "Items")?.value || 0;
            const subtotal = currentOrderForm?.value || 0;

            const floatingBuyButtonContainer = document.createElement("div");
            floatingBuyButtonContainer.setAttribute(
                "data-floating-summary-created",
                "true"
            ); // Marca como criado por nós
            floatingBuyButtonContainer.setAttribute("id", "react-floating-summary"); // Marca como criado por nós
            floatingBuyButtonContainer.innerHTML = `
        <div class="floating-buy-button-container">
          <div class="floating-buy-button-container-total">
            <p class="floating-buy-button-container-total-subtotal">Subtotal: ${checkoutCustom.formatCurrency(
                subtotal
            )}</p>
            <p class="floating-buy-button-container-total-total">TOTAL: ${checkoutCustom.formatCurrency(
                total
            )}</p>
          </div>
          <a href="/checkout/#/orderform">
            <button class="floating-buy-button-container-button">FINALIZAR COMPRA</button>
          </a>
        </div>`;

            const existingFloatingBuyButtonContainer = document.querySelector(
                "#react-floating-summary"
            );
            if (existingFloatingBuyButtonContainer) {
                floatingBuyButtonContainer.removeChild(
                    existingFloatingBuyButtonContainer
                );
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] Botão de compra flutuante anterior removido"
                );
            }

            const summaryContainer = document.querySelector(
                ".cart-template .summary-template-holder"
            );
            summaryContainer.appendChild(floatingBuyButtonContainer);
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível criar botão de compra flutuante:",
                error.message
            );
        }
    },
    /**
     * Cria customizado sumario
     */
    createCustomSummaryAccordionInCart: async function () {
        try {
            await this.createCustomCouponField();
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível criar campo de cupom:",
                error.message
            );
        }

        try {
            await this.createCustomSellerField();
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível criar campo de vendedor:",
                error.message
            );
        }

        // Tenta criar accordion para shipping após criar o cart
        try {
            await this.createShippingAccordionInCart();
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível criar accordion para shipping no cart:",
                error.message
            );
        }

        try {
            await this.createCouponAccordionInCart();
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível criar accordion para coupon no cart:",
                error.message
            );
        }

        // Cria o elemento do summary
        const summaryElement = document.createElement("div");
        const summaryContainer = document.querySelector(
            ".cart-template .summary-template-holder"
        );
        summaryElement.setAttribute("id", "front-product-summary");
        summaryElement.setAttribute("data-orderform-updatable", "true");

        // Atualiza o conteúdo inicial
        this.updateSummaryContent(summaryElement);

        if (summaryContainer) {
            if (!document.getElementById("front-product-summary")) {
                summaryContainer.after(summaryElement);
            }

            console.log(
                "[CartCustomPlugin] Resumo do pedido criado com atualização automática"
            );

            // Configura atualização automática quando orderForm mudar
            this.setupSummaryAutoUpdate(summaryElement);
        } else {
            console.warn("[CartCustomPlugin] Container de summary não encontrado");
        }
    },



    /**
     * Insere informações de mais opções no elemento .cart-more-options
     * Usa observer para aguardar o elemento ser renderizado no DOM
     */
    createCartMoreOptionsInfo: async function () {
        const selector = '.cart-more-options';
        const self = this;

        // Verifica se o elemento já existe
        const existingElement = document.querySelector(selector);
        if (existingElement) {
            // Se já existe, tenta inserir diretamente
            this.insertCartMoreOptionsInfo(existingElement);
            return;
        }

        // Se não existe, usa observer para aguardar renderização
        try {
            const elementObserver = checkoutCustom.utils.elementObserver;

            elementObserver.observeElement(
                selector,
                (cartMoreOptionsElement) => {
                    // Quando o elemento for encontrado, insere o conteúdo
                    self.insertCartMoreOptionsInfo(cartMoreOptionsElement);
                    
                    // Desativa o observer após inserir
                    elementObserver.stopObserving(selector);
                },
                {
                    persistent: false, // Para de observar após encontrar
                    timeout: 15000, // 15 segundos de timeout
                }
            );

            console.log(
                "[CartCustomPlugin] Observando elemento .cart-more-options para inserir informações"
            );
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Erro ao configurar observer para .cart-more-options:",
                error.message
            );
        }
    },

    /**
     * Insere o HTML de informações no elemento .cart-more-options
     */
    insertCartMoreOptionsInfo: function (cartMoreOptionsElement) {
        try {
            if (!cartMoreOptionsElement) {
                console.warn(
                    "[CartCustomPlugin] Elemento .cart-more-options não fornecido"
                );
                return false;
            }

            // Verifica se o elemento já existe para evitar duplicatas
            const existingInfo = cartMoreOptionsElement.querySelector('.cart-more-options-info');
            if (existingInfo) {
                console.log(
                    "[CartCustomPlugin] Informação de mais opções já existe, não será adicionada novamente"
                );
                return true;
            }

            // Cria o container principal
            const infoContainer = document.createElement('div');
            infoContainer.className = 'cart-more-options-info';

            // Cria o container do ícone
            const iconContainer = document.createElement('div');
            iconContainer.className = 'cart-more-options-info-icon';

            // Cria o SVG
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('width', '33');
            svg.setAttribute('height', '33');
            svg.setAttribute('viewBox', '0 0 33 33');
            svg.setAttribute('fill', 'none');

            // Cria o rect do SVG
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '33');
            rect.setAttribute('height', '33');
            rect.setAttribute('rx', '10');
            rect.setAttribute('fill', '#F9B9DA');
            rect.setAttribute('fill-opacity', '0.2');

            // Cria o primeiro path (círculo)
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M16.5 23.625C20.435 23.625 23.625 20.435 23.625 16.5C23.625 12.565 20.435 9.375 16.5 9.375C12.565 9.375 9.375 12.565 9.375 16.5C9.375 20.435 12.565 23.625 16.5 23.625Z');
            path1.setAttribute('stroke', '#FF78B0');
            path1.setAttribute('stroke-width', '2');
            path1.setAttribute('stroke-linecap', 'round');
            path1.setAttribute('stroke-linejoin', 'round');

            // Cria o segundo path (linha vertical)
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'M15.9062 15.9062H16.5V20.0625H17.0938');
            path2.setAttribute('stroke', '#FF78B0');
            path2.setAttribute('stroke-width', '2');
            path2.setAttribute('stroke-linecap', 'round');
            path2.setAttribute('stroke-linejoin', 'round');

            // Cria o terceiro path (ponto)
            const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path3.setAttribute('d', 'M16.3516 14.125C16.8434 14.125 17.2422 13.7263 17.2422 13.2344C17.2422 12.7425 16.8434 12.3438 16.3516 12.3438C15.8597 12.3438 15.4609 12.7425 15.4609 13.2344C15.4609 13.7263 15.8597 14.125 16.3516 14.125Z');
            path3.setAttribute('fill', '#FF78B0');

            // Adiciona os elementos ao SVG
            svg.appendChild(rect);
            svg.appendChild(path1);
            svg.appendChild(path2);
            svg.appendChild(path3);

            // Adiciona o SVG ao container do ícone
            iconContainer.appendChild(svg);

            // Cria o span com o texto
            const textSpan = document.createElement('span');
            textSpan.className = 'cart-more-options-info-text';
            textSpan.textContent = 'Os prazos de Entrega e Retirada se iniciam após a confirmação de pagamento';

            // Adiciona os elementos ao container principal
            infoContainer.appendChild(iconContainer);
            infoContainer.appendChild(textSpan);

            // Adiciona o container ao elemento .cart-more-options
            cartMoreOptionsElement.appendChild(infoContainer);

            console.log(
                "[CartCustomPlugin] Informação de mais opções inserida com sucesso"
            );
            return true;
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível inserir informação de mais opções:",
                error.message
            );
            return false;
        }
    },

    /**
     * Move o link "Não sei meu CEP" de p.ship-postalCode para .vtex-shipping-preview-0-x-postalCodeForgotten
     * Usa observer para aguardar o elemento ser renderizado no DOM
     */
    createPostalCodeForgottenLink: async function () {
        const targetSelector = '.vtex-shipping-preview-0-x-postalCodeForgotten';
        const sourceSelector = 'p.ship-postalCode';
        const self = this;

        // Verifica se o elemento destino já existe
        const existingTargetElement = document.querySelector(targetSelector);
        if (existingTargetElement) {
            // Se já existe, tenta mover o link diretamente
            this.movePostalCodeForgottenLink(existingTargetElement, sourceSelector);
            return;
        }

        // Se não existe, usa observer para aguardar renderização
        try {
            const elementObserver = checkoutCustom.utils.elementObserver;

            elementObserver.observeElement(
                targetSelector,
                (postalCodeForgottenElement) => {
                    // Quando o elemento for encontrado, move o link
                    self.movePostalCodeForgottenLink(postalCodeForgottenElement, sourceSelector);
                    
                    // Desativa o observer após mover
                    elementObserver.stopObserving(targetSelector);
                },
                {
                    persistent: false, // Para de observar após encontrar
                    timeout: 15000, // 15 segundos de timeout
                }
            );

            console.log(
                "[CartCustomPlugin] Observando elemento .vtex-shipping-preview-0-x-postalCodeForgotten para mover link"
            );
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Erro ao configurar observer para .vtex-shipping-preview-0-x-postalCodeForgotten:",
                error.message
            );
        }
    },

    /**
     * Move o link "Não sei meu CEP" de p.ship-postalCode para .vtex-shipping-preview-0-x-postalCodeForgotten
     */
    movePostalCodeForgottenLink: function (postalCodeForgottenElement, sourceSelector) {
        try {
            if (!postalCodeForgottenElement) {
                console.warn(
                    "[CartCustomPlugin] Elemento .vtex-shipping-preview-0-x-postalCodeForgotten não fornecido"
                );
                return false;
            }

            // Verifica se o link ainda está dentro de p.ship-postalCode
            const sourceElement = document.querySelector(sourceSelector);
            const linkInSource = sourceElement ? sourceElement.querySelector('a[href*="buscacepinter.correios.com.br"]') : null;
            
            // Se o link não estiver mais em p.ship-postalCode, verifica se já está no destino
            if (!linkInSource) {
                const existingLinkInTarget = postalCodeForgottenElement.querySelector('a[href*="buscacepinter.correios.com.br"]');
                if (existingLinkInTarget) {
                    console.log(
                        "[CartCustomPlugin] Link 'Não sei meu CEP' já foi movido anteriormente, não será movido novamente"
                    );
                    return true;
                }
                
                // Se não está no fonte nem no destino, cria um novo
                if (!sourceElement) {
                    console.warn(
                        "[CartCustomPlugin] Elemento p.ship-postalCode não encontrado, criando novo link"
                    );
                } else {
                    console.warn(
                        "[CartCustomPlugin] Link não encontrado em p.ship-postalCode, criando novo link"
                    );
                }
                return this.createNewPostalCodeForgottenLink(postalCodeForgottenElement);
            }

            // Move o link do elemento fonte para o elemento destino
            postalCodeForgottenElement.appendChild(linkInSource);

            console.log(
                "[CartCustomPlugin] Link 'Não sei meu CEP' movido de p.ship-postalCode para .vtex-shipping-preview-0-x-postalCodeForgotten com sucesso"
            );
            return true;
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível mover link 'Não sei meu CEP':",
                error.message
            );
            return false;
        }
    },

    /**
     * Cria um novo link "Não sei meu CEP" caso o link original não seja encontrado
     */
    createNewPostalCodeForgottenLink: function (postalCodeForgottenElement) {
        try {
            // Cria o elemento <a>
            const link = document.createElement('a');
            link.href = '//buscacepinter.correios.com.br/app/endereco/index.php?t';
            link.target = '_blank';
            link.rel = 'noreferrer';
            link.textContent = 'Não sei meu CEP';

            // Adiciona o link dentro do elemento
            postalCodeForgottenElement.appendChild(link);

            console.log(
                "[CartCustomPlugin] Link 'Não sei meu CEP' criado e inserido com sucesso"
            );
            return true;
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível criar link 'Não sei meu CEP':",
                error.message
            );
            return false;
        }
    },

    /**
     * Move o link a#cart-to-orderform de .cart-links para div.summary-totalizers.cart-totalizers
     * Usa observer para aguardar o elemento .cart-links.cart-links-bottom ser renderizado no DOM
     */
    moveCartToOrderformLink: async function () {
        const observerSelector = '.cart-links.cart-links-bottom';
        const sourceSelector = '.cart-links';
        const targetSelector = 'div.summary-totalizers.cart-totalizers';
        const linkSelector = 'a#cart-to-orderform';
        const self = this;

        // Verifica se o elemento observado já existe
        const existingObserverElement = document.querySelector(observerSelector);
        if (existingObserverElement) {
            // Se já existe, tenta mover o link diretamente
            this.moveCartToOrderformLinkToTarget(sourceSelector, targetSelector, linkSelector);
            return;
        }

        // Se não existe, usa observer para aguardar renderização
        try {
            const elementObserver = checkoutCustom.utils.elementObserver;

            elementObserver.observeElement(
                observerSelector,
                (cartLinksElement) => {
                    // Quando o elemento for encontrado, move o link
                    self.moveCartToOrderformLinkToTarget(sourceSelector, targetSelector, linkSelector);
                    
                    // Desativa o observer após mover
                    elementObserver.stopObserving(observerSelector);
                },
                {
                    persistent: false, // Para de observar após encontrar
                    timeout: 15000, // 15 segundos de timeout
                }
            );

            console.log(
                "[CartCustomPlugin] Observando elemento .cart-links.cart-links-bottom para mover link a#cart-to-orderform"
            );
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Erro ao configurar observer para .cart-links.cart-links-bottom:",
                error.message
            );
        }
    },

    /**
     * Move o link a#cart-to-orderform de .cart-links para div.summary-totalizers.cart-totalizers
     */
    moveCartToOrderformLinkToTarget: function (sourceSelector, targetSelector, linkSelector) {
        try {
            // Verifica se o link ainda está dentro de .cart-links
            const sourceElement = document.querySelector(sourceSelector);
            const linkInSource = sourceElement ? sourceElement.querySelector(linkSelector) : null;
            
            // Se o link não estiver mais em .cart-links, verifica se já está no destino
            if (!linkInSource) {
                const targetElement = document.querySelector(targetSelector);
                const existingLinkInTarget = targetElement ? targetElement.querySelector(linkSelector) : null;
                
                if (existingLinkInTarget) {
                    console.log(
                        "[CartCustomPlugin] Link a#cart-to-orderform já foi movido anteriormente, não será movido novamente"
                    );
                    return true;
                }
                
                // Se não está no fonte nem no destino
                if (!sourceElement) {
                    console.warn(
                        "[CartCustomPlugin] Elemento .cart-links não encontrado"
                    );
                } else {
                    console.warn(
                        "[CartCustomPlugin] Link a#cart-to-orderform não encontrado em .cart-links"
                    );
                }
                return false;
            }

            // Verifica se o elemento destino existe
            const targetElement = document.querySelector(targetSelector);
            if (!targetElement) {
                console.warn(
                    "[CartCustomPlugin] Elemento div.summary-totalizers.cart-totalizers não encontrado"
                );
                return false;
            }

            // Verifica se o link já existe no destino para evitar duplicatas
            const existingLinkInTarget = targetElement.querySelector(linkSelector);
            if (existingLinkInTarget) {
                console.log(
                    "[CartCustomPlugin] Link a#cart-to-orderform já existe no destino, não será movido novamente"
                );
                return true;
            }

            // Move o link do elemento fonte para o elemento destino
            targetElement.appendChild(linkInSource);

            console.log(
                "[CartCustomPlugin] Link a#cart-to-orderform movido de .cart-links para div.summary-totalizers.cart-totalizers com sucesso"
            );
            return true;
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível mover link a#cart-to-orderform:",
                error.message
            );
            return false;
        }
    },

    /**
     * Move a div #cartLoadedDiv.cart-template-holder para dentro de .row-fluid.summary
     * A div será posicionada como primeiro filho
     * Usa observer para aguardar o elemento .row-fluid.summary ser renderizado no DOM
     */
    moveCartLoadedDivToSummary: async function () {
        const targetSelector = '.row-fluid.summary';
        const sourceSelector = '#cartLoadedDiv.cart-template-holder';
        const self = this;

        // Verifica se o elemento destino já existe
        const existingTargetElement = document.querySelector(targetSelector);
        if (existingTargetElement) {
            // Se já existe, tenta mover a div diretamente
            this.moveCartLoadedDivToSummaryTarget(targetSelector, sourceSelector);
            return;
        }

        // Se não existe, usa observer para aguardar renderização
        try {
            const elementObserver = checkoutCustom.utils.elementObserver;

            elementObserver.observeElement(
                targetSelector,
                (summaryElement) => {
                    // Quando o elemento for encontrado, move a div
                    self.moveCartLoadedDivToSummaryTarget(targetSelector, sourceSelector);
                    
                    // Desativa o observer após mover
                    elementObserver.stopObserving(targetSelector);
                },
                {
                    persistent: false, // Para de observar após encontrar
                    timeout: 15000, // 15 segundos de timeout
                }
            );

            console.log(
                "[CartCustomPlugin] Observando elemento .row-fluid.summary para mover div #cartLoadedDiv.cart-template-holder"
            );
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Erro ao configurar observer para .row-fluid.summary:",
                error.message
            );
        }
    },

    /**
     * Move a div #cartLoadedDiv.cart-template-holder para dentro de .row-fluid.summary como primeiro filho
     */
    moveCartLoadedDivToSummaryTarget: function (targetSelector, sourceSelector) {
        try {
            // Verifica se o elemento destino existe
            const targetElement = document.querySelector(targetSelector);
            if (!targetElement) {
                console.warn(
                    "[CartCustomPlugin] Elemento .row-fluid.summary não encontrado"
                );
                return false;
            }

            // Verifica se a div a ser movida existe
            const sourceElement = document.querySelector(sourceSelector);
            if (!sourceElement) {
                console.warn(
                    "[CartCustomPlugin] Elemento #cartLoadedDiv.cart-template-holder não encontrado"
                );
                return false;
            }

            // Verifica se a div já está no destino para evitar duplicatas
            const existingDivInTarget = targetElement.querySelector(sourceSelector);
            if (existingDivInTarget) {
                console.log(
                    "[CartCustomPlugin] Div #cartLoadedDiv.cart-template-holder já está no destino, não será movida novamente"
                );
                return true;
            }

            // Move a div para dentro do elemento destino como primeiro filho
            targetElement.prepend(sourceElement);

            console.log(
                "[CartCustomPlugin] Div #cartLoadedDiv.cart-template-holder movida para .row-fluid.summary como primeiro filho com sucesso"
            );
            return true;
        } catch (error) {
            console.warn(
                "[CartCustomPlugin] Não foi possível mover div #cartLoadedDiv.cart-template-holder:",
                error.message
            );
            return false;
        }
    },

    /**
     * Atualiza o conteúdo do resumo do pedido
     */
    updateSummaryContent: function (summaryElement) {
        try {
            // Obtém dados atualizados do orderForm
            const orderForm = checkoutCustom.getOrderForm();
            const total = checkoutCustom.getTotal() || 0;
            const subtotal = checkoutCustom.getOrderFormData("value") || 0;
            const shippingData = checkoutCustom.getOrderFormData("shippingData");
            const selectedAddress = checkoutCustom.getOrderFormData(
                "shippingData.selectedAddresses[0]"
            );
            const shippingValue =
                checkoutCustom.getOrderFormData(
                    "shippingData.logisticsInfo[0].slas[0].price"
                ) || 0;

            // Calcula valores
            // const discount = Math.max(0, subtotal - total - shippingValue);
            const discount = orderForm?.totalizers?.find(totalizer => totalizer.id === 'Discounts')?.value ?? 0;

            // Formata valores usando o método do CheckoutCustom
            const formatCurrency = checkoutCustom.formatCurrency.bind(checkoutCustom);

            // Verifica se há frete selecionado
            const hasShippingSelected = orderForm?.totalizers?.find(totalizer => totalizer.id === 'Shipping')?.value ?? null;


            summaryElement.innerHTML = `
          <div class="front-product-summary">
            <p class="front-product-summary-title">Resumo do pedido</p>
            <div class="sc-cVzyXs bkgnqt front-product-summary-container">
              <div class="front-product-summary-item">
                <p class="front-product-summary-item-title">Subtotal</p>
                <p class="front-product-summary-item-value">${formatCurrency(
                subtotal
            )}</p>
              </div>
              <div class="front-product-summary-item">
                <p class="front-product-summary-item-title">Entrega</p>
                <p class="front-product-summary-item-value ${hasShippingSelected !== null ? "" : "highlight"}">${hasShippingSelected !== null
                    ? formatCurrency(hasShippingSelected)
                    : "A Calcular"
                }</p>
              </div>
              <div class="front-product-summary-item">
                <p class="front-product-summary-item-title">Descontos</p>
                <p class="front-product-summary-item-value">${discount > 0
                    ? `-${formatCurrency(discount)}`
                    : formatCurrency(0)
                }</p>
              </div>
              <div class="front-product-summary-item">
                <p class="front-product-summary-item-title">Total</p>
                <p class="front-product-summary-item-value">${formatCurrency(
                    total
                )}</p>
              </div>
            </div>
            <div class="front-product-summary-buttons">
              <a href="/checkout/#/payment" class="checkout-button primary" onclick="checkoutCustom.emit('checkoutCustom:proceedToCheckout')">
                FECHAR PEDIDO
              </a>
            </div>
          </div>
        `;

            checkoutCustom.utils.log(
                "[CartCustomPlugin] Resumo do pedido atualizado com valores:",
                {
                    subtotal: formatCurrency(subtotal),
                    shipping: formatCurrency(shippingValue),
                    discount: formatCurrency(discount),
                    total: formatCurrency(total),
                }
            );
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao atualizar conteúdo do resumo:",
                error
            );
            this.logError("updateSummaryContent", error);
        }
    },

    /**
     * Configura atualização automática do resumo
     */
    setupSummaryAutoUpdate: function (summaryElement) {
        console.log(
            "[CartCustomPlugin] Configurando atualização automática do resumo"
        );

        // Hook para atualização do orderForm
        checkoutCustom.addHook(
            "onOrderFormUpdate",
            (orderForm, previousOrderForm) => {
                console.log(
                    "[CartCustomPlugin] Atualizando resumo via hook orderFormUpdate"
                );
                try {
                    this.updateSummaryContent(summaryElement);
                } catch (error) {
                    console.error(
                        "[CartCustomPlugin] Erro na atualização automática do resumo:",
                        error
                    );
                }
            }
        );

        // Hook para mudança de página (pode afetar disponibilidade do frete)
        checkoutCustom.addHook("afterPageChange", (newPage) => {
            console.log(
                `[CartCustomPlugin] Página mudou para ${newPage}, atualizando resumo`
            );
            try {
                setTimeout(() => {
                    this.updateSummaryContent(summaryElement);
                }, 500); // Pequeno delay para garantir que orderForm foi atualizado
            } catch (error) {
                console.error(
                    "[CartCustomPlugin] Erro ao atualizar resumo na mudança de página:",
                    error
                );
            }
        });

        console.log(
            "[CartCustomPlugin] Atualização automática do resumo configurada"
        );
    },

    createCouponAccordionInCart: async function () {
        try {
            // Verifica se o contexto está correto antes de prosseguir
            if (!this) {
                console.error(
                    "[CartCustomPlugin] Contexto perdido no createCouponAccordionInCart"
                );
                return false;
            }

            console.log(
                "[CartCustomPlugin] Criando accordion de coupon dentro do cart..."
            );

            const result = await this.safeExecute(this.createAccordion, this, {
                targetSelector: ".summary-template-holder .cart-totalizers",
                accordionId: "react-coupon-accordion-cart",
                title: "Adicionar cupom",
                description: "Adicione um cupom de desconto para seu pedido.",
                insertBefore: true,
                initialState: true,
                waitTime: 15000, // Aumentado para SPAs
                exclusiveMode: true,
                useObserver: true, // Usar sistema de observação
            });

            if (result && result.targetContainer) {
                // Adiciona classe para indicar que está sendo controlado por accordion
                result.targetContainer.classList.add("accordion-controlled");
                console.log(
                    "[CartCustomPlugin] Classe 'accordion-controlled' adicionada ao coupon container"
                );
            }
            return result;
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao criar accordion de coupon dentro do cart:",
                error
            );
            this.logError("createCouponAccordionInCart", error);
            throw error;
        }
    },
    /**
     * Cria accordion específico para shipping dentro do cart
     */
    createShippingAccordionInCart: async function () {
        try {
            // Verifica se o contexto está correto antes de prosseguir
            if (!this) {
                console.error(
                    "[CartCustomPlugin] Contexto perdido no createShippingAccordionInCart"
                );
                return false;
            }

            console.log(
                "[CartCustomPlugin] Criando accordion de shipping dentro do cart..."
            );

            // Cria accordion usando a função genérica com timeout aumentado
            const result = await this.safeExecute(this.createAccordion, this, {
                targetSelector: "#shipping-preview-container",
                accordionId: "react-shipping-accordion-cart",
                title: "Adicionar frete",
                description: "Consulte as opções de entrega ou retirada em loja.",
                insertBefore: true,
                exclusiveMode: true,
                waitTime: 15000, // Aumentado para SPAs
                useObserver: true, // Usar sistema de observação
            });

            if (result && result.targetContainer) {
                // Adiciona classe para indicar que está sendo controlado por accordion
                result.targetContainer.classList.add("accordion-controlled");
                console.log(
                    "[CartCustomPlugin] Classe 'accordion-controlled' adicionada ao shipping container"
                );
            }

            return result;
        } catch (error) {
            console.error(
                "[CartCustomPlugin] Erro ao criar accordion de shipping no cart:",
                error
            );
            this.logError("createShippingAccordionInCart", error);
            throw error;
        }
    },

    /**
     * Gera assinatura única para um accordion baseado no targetSelector
     */
    generateAccordionSignature: function (targetSelector, accordionId) {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return null;

        // Cria assinatura baseada em características do elemento alvo
        const signature = {
            targetSelector,
            accordionId,
            accordionType: accordionId.includes("-cart")
                ? "cart-accordion"
                : "standard-accordion",
            targetClasses: targetElement.className,
            targetTag: targetElement.tagName,
            parentClasses: targetElement.parentNode
                ? targetElement.parentNode.className
                : "",
            siblingCount: targetElement.parentNode
                ? targetElement.parentNode.children.length
                : 0,
            timestamp: Date.now(),
        };

        return signature;
    },

    /**
     * Registra um accordion no sistema de tracking
     */
    registerAccordion: function (accordionId, targetSelector, accordionElement) {
        const signature = this.generateAccordionSignature(
            targetSelector,
            accordionId
        );
        if (signature) {
            this.state.accordions.set(accordionId, {
                signature,
                element: accordionElement,
                createdAt: Date.now(),
                lastValidated: Date.now(),
            });
            console.log(
                `[CartCustomPlugin] Accordion ${accordionId} registrado no tracking`
            );
        }
    },

    /**
     * Valida se um accordion ainda é válido (não está órfão)
     */
    validateAccordion: function (accordionId) {
        const accordionData = this.state.accordions.get(accordionId);
        if (!accordionData) return false;

        const { signature, element } = accordionData;
        const currentTarget = document.querySelector(signature.targetSelector);

        if (!currentTarget || !element || !element.parentNode) {
            console.log(
                `[CartCustomPlugin] Accordion ${accordionId} inválido - elemento removido`
            );
            return false;
        }

        // Verifica se a posição ainda está correta
        const isPositionCorrect = signature.targetSelector.includes(
            "#shipping-preview-container"
        )
            ? currentTarget.previousElementSibling === element ||
            currentTarget.nextElementSibling === element
            : true; // Para outros selectors, usa validação mais simples

        if (isPositionCorrect) {
            accordionData.lastValidated = Date.now();
            return true;
        }

        checkoutCustom.utils.log(`[CartCustomPlugin] Accordion ${accordionId} fora de posição`);
        return false;
    },

    /**
     * Tenta reconectar accordion órfão ao novo targetSelector (modo SPA)
     */
    reconnectOrphanedAccordion: function (accordionId, targetSelector) {
        const accordionData = this.state.accordions.get(accordionId);
        if (!accordionData) return false;

        const { element } = accordionData;
        const newTarget = document.querySelector(targetSelector);

        if (!element || !newTarget) return false;

        // Remove o accordion da posição antiga
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }

        // Reconecta na nova posição
        const finalConfig = { insertBefore: true }; // Configuração padrão para reconexão
        if (finalConfig.insertBefore) {
            newTarget.parentNode.insertBefore(element, newTarget);
        } else {
            newTarget.parentNode.insertBefore(element, newTarget.nextSibling);
        }

        // Atualiza a assinatura
        const newSignature = this.generateAccordionSignature(
            targetSelector,
            accordionId
        );
        if (newSignature) {
            accordionData.signature = newSignature;
            accordionData.lastValidated = Date.now();
        }

        console.log(
            `[CartCustomPlugin] Accordion ${accordionId} reconectado ao novo target`
        );
        return true;
    },

    /**
     * Limpa accordions órfãos
     */
    cleanupOrphanedAccordions: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] Verificando accordions órfãos..."
        );

        let cleanedCount = 0;
        let reconnectedCount = 0;

        // Primeiro, tenta reconectar accordions órfãos se o target ainda existir
        for (const [accordionId, accordionData] of this.state.accordions) {
            if (!this.validateAccordion(accordionId)) {
                const { signature } = accordionData;
                const targetStillExists = document.querySelector(
                    signature.targetSelector
                );

                if (targetStillExists && this.state.spaMode) {
                    // Tenta reconectar em vez de remover
                    if (
                        this.reconnectOrphanedAccordion(
                            accordionId,
                            signature.targetSelector
                        )
                    ) {
                        reconnectedCount++;
                    } else {
                        // Se não conseguir reconectar, remove
                        this.state.accordions.delete(accordionId);
                        cleanedCount++;
                    }
                } else {
                    // Target não existe mais ou não está em modo SPA
                    this.state.accordions.delete(accordionId);
                    cleanedCount++;
                }
            }
        }

        // Verificação adicional para accordions não registrados no sistema
        const knownAccordions = [
            {
                id: "react-shipping-accordion",
                targetSelector: "#shipping-preview-container",
            },
            {
                id: "react-shipping-accordion-cart",
                targetSelector: "#shipping-preview-container",
            },
        ];

        knownAccordions.forEach(({ id, targetSelector }) => {
            const accordion = document.querySelector(`#${id}`);

            if (accordion && !this.state.accordions.has(id)) {
                // Estratégia especial para duplicatas: se existe accordion padrão E cart-accordion,
                // sempre remova o padrão (priorize o cart-accordion)
                if (id === "react-shipping-accordion") {
                    const cartAccordion = document.querySelector(
                        "#react-shipping-accordion-cart"
                    );
                    if (cartAccordion) {
                        console.log(
                            `[CartCustomPlugin] Removendo accordion padrão duplicado (priorizando cart-accordion): ${id}`
                        );
                        if (accordion.parentNode) {
                            accordion.parentNode.removeChild(accordion);
                            cleanedCount++;
                        }
                        return;
                    }
                }

                // Accordion existe mas não está registrado - provavelmente órfão
                console.log(
                    `[CartCustomPlugin] Removendo accordion não registrado: ${id}`
                );
                if (accordion.parentNode) {
                    accordion.parentNode.removeChild(accordion);
                    cleanedCount++;
                }
            }
        });

        console.log(
            `[CartCustomPlugin] Reconectados: ${reconnectedCount}, Removidos: ${cleanedCount}`
        );
        this.state.lastCleanup = Date.now();

        return { reconnected: reconnectedCount, cleaned: cleanedCount };
    },

    /**
     * Debug dos accordions
     */
    debugAccordions: function () {
        checkoutCustom.utils.log(
            "[CartCustomPlugin] === DEBUG: Estado dos Accordions ==="
        );

        const accordions = document.querySelectorAll(
            '[id^="react-shipping-accordion"]'
        );
        console.log(`Total de accordions encontrados no DOM: ${accordions.length}`);
        console.log(
            `Total de accordions no tracking: ${this.state.accordions.size}`
        );
        console.log(`Modo SPA: ${this.state.spaMode}`);
        console.log(
            `Última limpeza: ${this.state.lastCleanup
                ? new Date(this.state.lastCleanup).toLocaleString()
                : "Nunca"
            }`
        );

        // Mostra accordions registrados no tracking
        console.log("\n=== Accordions no Sistema de Tracking ===");
        for (const [accordionId, accordionData] of this.state.accordions) {
            const { signature, element, createdAt, lastValidated } = accordionData;
            const isValid = this.validateAccordion(accordionId);

            console.log(`📋 ${accordionId}:`);
            console.log(`   ✅ Válido: ${isValid}`);
            console.log(`   🎯 Target: ${signature.targetSelector}`);
            console.log(`   📅 Criado: ${new Date(createdAt).toLocaleTimeString()}`);
            console.log(
                `   🔍 Última validação: ${new Date(
                    lastValidated
                ).toLocaleTimeString()}`
            );
            console.log(`   📍 Elemento existe: ${!!element}`);
            console.log("---");
        }

        // Mostra accordions no DOM (mesmo os não registrados)
        console.log("\n=== Accordions no DOM ===");
        accordions.forEach((accordion, index) => {
            const accordionId = accordion.id;
            const position = accordion.previousElementSibling ? "after" : "before";
            const sibling =
                accordion.previousElementSibling || accordion.nextElementSibling;
            const siblingId = sibling ? sibling.id || sibling.className : "none";
            const isTracked = this.state.accordions.has(accordionId);

            console.log(
                `${index + 1}. ${accordionId} ${isTracked ? "(✅ RASTREADO)" : "(❌ ÓRFÃO)"
                }`
            );
            console.log(`   Posição: ${position} ${siblingId}`);
            console.log(
                `   Parent: ${accordion.parentNode ? accordion.parentNode.tagName : "none"
                }`
            );
            console.log(`   Classes: ${accordion.className}`);
            console.log("---");
        });

        return {
            domCount: accordions.length,
            trackedCount: this.state.accordions.size,
        };
    },

    /**
     * Debug do sistema de observação de elementos
     */
    debugElementObserver: function () {
        console.log("[ElementObserver] === DEBUG: Sistema de Observação ===");

        // Verifica se o elementObserver existe
        if (
            !window.checkoutCustom ||
            !window.checkoutCustom.utils ||
            !window.checkoutCustom.utils.elementObserver
        ) {
            console.log("❌ ElementObserver não encontrado");
            return { observers: 0, pendingTasks: 0 };
        }

        const eo = window.checkoutCustom.utils.elementObserver;
        console.log(`Observadores ativos: ${eo.observers.size}`);
        console.log(`Tarefas pendentes: ${eo.pendingTasks.size}`);

        // Mostra observadores ativos
        console.log("\n=== Observadores Ativos ===");
        for (const [selector, observation] of eo.observers) {
            const { config, callback } = observation;
            console.log(`📍 ${selector}:`);
            console.log(`   Timeout: ${config.timeout}ms`);
            console.log(`   Persistent: ${config.persistent}`);
            console.log(`   Max Retries: ${config.maxRetries}`);
            console.log("---");
        }

        // Mostra tarefas pendentes
        console.log("\n=== Tarefas Pendentes ===");
        for (const [selector, tasks] of eo.pendingTasks) {
            console.log(`📋 ${selector}: ${tasks.length} tarefa(s)`);
        }

        return {
            observers: eo.observers.size,
            pendingTasks: eo.pendingTasks.size,
        };
    },

    /**
     * Remove accordion do sistema de tracking
     */
    unregisterAccordion: function (accordionId) {
        if (this.state.accordions.has(accordionId)) {
            this.state.accordions.delete(accordionId);
            console.log(
                `[CartCustomPlugin] Accordion ${accordionId} removido do tracking`
            );
            return true;
        }
        return false;
    },

    /**
     * Diagnóstico completo do sistema
     */
    systemDiagnostics: function () {
        console.log("🔍 === DIAGNÓSTICO COMPLETO DO SISTEMA ===");

        // Verificar checkoutCustom
        console.log("\n📦 CheckoutCustom:");
        if (typeof window.checkoutCustom === "undefined") {
            console.log("  ❌ Não encontrado");
        } else {
            console.log("  ✅ Encontrado");
            console.log(
                "  📋 Plugins registrados:",
                Object.keys(window.checkoutCustom.registeredPlugins || {}).length
            );
        }

        // Verificar utils
        console.log("\n🔧 Utils:");
        if (!window.checkoutCustom || !window.checkoutCustom.utils) {
            console.log("  ❌ Não encontrado");
        } else {
            console.log("  ✅ Encontrado");
        }

        // Verificar elementObserver
        console.log("\n👁️ ElementObserver:");
        if (
            !window.checkoutCustom ||
            !window.checkoutCustom.utils ||
            !window.checkoutCustom.utils.elementObserver
        ) {
            console.log("  ❌ Não encontrado");
        } else {
            const eo = window.checkoutCustom.utils.elementObserver;
            console.log("  ✅ Encontrado");
            console.log(
                "  📊 Observadores ativos:",
                eo.observers ? eo.observers.size : "N/A"
            );
            console.log(
                "  📋 Tarefas pendentes:",
                eo.pendingTasks ? eo.pendingTasks.size : "N/A"
            );
        }

        // Verificar plugin
        console.log("\n🔌 CartCustomPlugin:");
        if (
            !window.checkoutCustom ||
            !window.checkoutCustom.registeredPlugins ||
            !window.checkoutCustom.registeredPlugins.cartCustom
        ) {
            console.log("  ❌ Não registrado");
        } else {
            const plugin = window.checkoutCustom.registeredPlugins.cartCustom;
            console.log("  ✅ Registrado");
            console.log(
                "  📊 Accordions no tracking:",
                plugin.state.accordions ? plugin.state.accordions.size : "N/A"
            );
            console.log(
                "  🔄 SPA Mode:",
                plugin.state.spaMode ? "Ativado" : "Desativado"
            );

            if (
                plugin.checkDependencies &&
                typeof plugin.checkDependencies === "function"
            ) {
                const depsOk = plugin.checkDependencies();
                console.log("  ✅ Dependências:", depsOk ? "OK" : "Com problemas");
            }
        }

        // Verificar elementos DOM
        console.log("\n🌐 Elementos DOM:");
        const selectors = [
            "#shipping-preview-container",
            "#react-shipping-accordion",
            "#react-shipping-accordion-cart",
        ];

        selectors.forEach((selector) => {
            const element = document.querySelector(selector);
            console.log(
                `  ${selector}: ${element ? "✅ Encontrado" : "❌ Não encontrado"}`
            );
        });

        console.log("\n🏁 === DIAGNÓSTICO CONCLUÍDO ===");
    },

    /**
     * Remove duplicatas de accordions para o mesmo targetSelector
     */
    removeDuplicateAccordions: function (targetSelector) {
        console.log(
            `[CartCustomPlugin] Verificando duplicatas para: ${targetSelector}`
        );

        const accordions = [
            document.querySelector("#react-shipping-accordion"),
            document.querySelector("#react-shipping-accordion-cart"),
        ].filter(Boolean);

        if (accordions.length <= 1) {
            checkoutCustom.utils.log(
                "[CartCustomPlugin] Não há duplicatas para remover"
            );
            return 0;
        }

        // Estratégia: manter apenas o cart-accordion, remover os outros
        let removedCount = 0;

        accordions.forEach((accordion, index) => {
            const accordionId = accordion.id;

            // Se não é o cart-accordion, remova
            if (accordionId !== "react-shipping-accordion-cart") {
                console.log(
                    `[CartCustomPlugin] Removendo accordion duplicado: ${accordionId}`
                );
                if (accordion.parentNode) {
                    accordion.parentNode.removeChild(accordion);
                    this.unregisterAccordion(accordionId);
                    removedCount++;
                }
            }
        });

        checkoutCustom.utils.log(`[CartCustomPlugin] ${removedCount} duplicatas removidas`);
        return removedCount;
    },

    /**
     * Limpeza periódica para SPAs (executa a cada 30 segundos)
     */
    setupSPACleanup: function () {
        if (!this.state.spaMode) return;

        const cleanupInterval = 30000; // 30 segundos

        setInterval(() => {
            const timeSinceLastCleanup = Date.now() - this.state.lastCleanup;
            if (timeSinceLastCleanup > cleanupInterval) {
                checkoutCustom.utils.log(
                    "[CartCustomPlugin] Executando limpeza periódica SPA..."
                );
                this.cleanupOrphanedAccordions();
            }
        }, cleanupInterval);

        checkoutCustom.utils.log(
            "[CartCustomPlugin] Limpeza periódica SPA configurada"
        );
    },
    /**
     * Obtém ícone de acordion baseado no estado de expansão
     */
    getAccordionIcon: function (isExpanded, customIcons) {
        const defaultIcons = {
            expanded: `<svg class="accordion-toggle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
            <path d="M18 12.5H6" stroke="#333333" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
            collapsed: `<svg class="accordion-toggle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 6V18M18 12H6" stroke="#333333" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        };

        const icons = customIcons || defaultIcons;
        return isExpanded ? icons.expanded : icons.collapsed;
    },

    /**
     * Cria accordion com sistema inteligente de tarefas pendentes
     *
     * - Verifica não só se accordion existe, mas também se está na posição correta
     * - Remove accordions órfãos que não estão mais conectados ao targetContainer
     * - Limpa duplicatas com mesmo ID antes de criar novo accordion
     * - Sistema de tarefas pendentes para elementos dinâmicos
     * - Observação contínua com retry exponencial
     */
    createAccordion: async function (config = {}) {
        try {
            // Verifica se o contexto está correto
            if (!this) {
                console.error(
                    "[CartCustomPlugin] Contexto inválido no createAccordion"
                );
                return false;
            }

            // Verifica se o método checkDependencies existe e executa
            if (
                this.checkDependencies &&
                typeof this.checkDependencies === "function"
            ) {
                if (!this.checkDependencies()) {
                    console.error(
                        "[CartCustomPlugin] Dependências faltando, abortando createAccordion"
                    );
                    return false;
                }
            } else {
                console.warn(
                    "[CartCustomPlugin] Método checkDependencies não encontrado, continuando..."
                );
            }

            // Garante acesso ao elementObserver através do checkoutCustom
            if (!this.elementObserver) {
                this.elementObserver =
                    window.checkoutCustom &&
                    window.checkoutCustom.utils &&
                    window.checkoutCustom.utils.elementObserver;
            }

            // Configurações padrão
            const defaultConfig = {
                targetSelector: "#shipping-preview-container",
                accordionId: "react-shipping-accordion",
                title: "Adicionar frete",
                description: "Consulte as opções de entrega ou retirada em loja.",
                insertBefore: true,
                waitTime: 15000, // Aumentado para SPAs
                customIcons: null, // { expanded: '<path>...</path>', collapsed: '<path>...</path>' }
                initialState: false, // false = colapsado, true = expandido
                useObserver: true, // Usar sistema de observação para SPAs
                exclusiveMode: false, // Se true, fecha outros accordions ao expandir este
            };

            // Mescla configurações
            const finalConfig = { ...defaultConfig, ...config };

            checkoutCustom.utils.log(
                "[CartCustomPlugin] Criando accordion...",
                finalConfig.title
            );

            // Estratégia híbrida: tenta imediato + observação contínua
            if (finalConfig.useObserver && this.state.spaMode) {
                return this.safeExecute(
                    this.createAccordionWithObserver,
                    this,
                    finalConfig
                );
            }

            // Método tradicional (fallback)
            try {
                const targetContainer = await this.safeExecute(
                    () =>
                        this.waitForElement(
                            finalConfig.targetSelector,
                            finalConfig.waitTime
                        ),
                    this
                );
                return this.safeExecute(
                    this.createAccordionCore,
                    this,
                    finalConfig,
                    targetContainer
                );
            } catch (error) {
                console.warn(
                    `[CartCustomPlugin] Elemento ${finalConfig.targetSelector} não encontrado, usando sistema de observação...`
                );
                return this.safeExecute(
                    this.createAccordionWithObserver,
                    this,
                    finalConfig
                );
            }
        } catch (error) {
            console.error("[CartCustomPlugin] Erro ao criar accordion:", error);
            this.logError("createAccordion", error);
            throw error;
        }
    },

    /**
     * Cria accordion usando sistema de observação inteligente
     */
    createAccordionWithObserver: function (config) {
        console.log(
            `[CartCustomPlugin] Usando observação para criar accordion: ${config.accordionId}`
        );

        // Verifica se o contexto está correto
        if (!this) {
            console.error(
                "[CartCustomPlugin] Contexto perdido no createAccordionWithObserver"
            );
            return Promise.resolve(false);
        }

        // Armazena referência do contexto atual com verificação adicional
        const self = this;

        // Verifica se o elementObserver existe e tem os métodos necessários
        if (
            !self.elementObserver ||
            typeof self.elementObserver.addPendingTask !== "function"
        ) {
            console.error(
                "[CartCustomPlugin] elementObserver não encontrado ou inválido, usando fallback..."
            );
            try {
                return self.createAccordionCore(config, null);
            } catch (fallbackError) {
                console.error(
                    "[CartCustomPlugin] Mesmo fallback falhou:",
                    fallbackError
                );
                return Promise.resolve(false);
            }
        }

        // Adiciona tarefa pendente para quando o elemento estiver disponível
        try {
            self.elementObserver.addPendingTask(
                config.targetSelector,
                (targetContainer) => {
                    console.log(
                        `[CartCustomPlugin] Elemento ${config.targetSelector} ficou disponível, criando accordion...`
                    );
                    try {
                        // Verifica novamente se o contexto ainda é válido
                        if (self && self.createAccordionCore) {
                            self.createAccordionCore(config, targetContainer);
                        } else {
                            console.error(
                                "[CartCustomPlugin] Contexto perdido na callback do elementObserver"
                            );
                        }
                    } catch (error) {
                        console.error(
                            `[CartCustomPlugin] Erro ao criar accordion via observação:`,
                            error
                        );
                    }
                },
                {
                    timeout: config.waitTime,
                    persistent: false, // Para de observar após encontrar
                }
            );
        } catch (taskError) {
            console.error(
                "[CartCustomPlugin] Erro ao adicionar tarefa pendente:",
                taskError
            );
            return Promise.resolve(false);
        }

        return Promise.resolve(true); // Retorna promise resolvida imediatamente
    },

    /**
     * Core da criação do accordion (lógica compartilhada)
     */
    createAccordionCore: function (finalConfig, targetContainer) {
        try {
            // Verifica se o contexto está correto
            if (!this) {
                console.error(
                    "[CartCustomPlugin] Contexto perdido no createAccordionCore"
                );
                return false;
            }
            // Limpa accordions órfãos primeiro
            this.cleanupOrphanedAccordions();

            // Verificação especial para prevenir duplicação: se estamos tentando criar o accordion padrão
            // mas já existe o cart-accordion, não crie o padrão
            if (finalConfig.accordionId === "react-shipping-accordion") {
                const existingCartAccordion = document.querySelector(
                    "#react-shipping-accordion-cart"
                );
                if (existingCartAccordion) {
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Cart-accordion já existe, pulando criação do accordion padrão"
                    );
                    return true;
                }
            }

            // Verifica se já existe um accordion válido na posição correta
            const existingAccordion = document.querySelector(
                `#${finalConfig.accordionId}`
            );

            if (existingAccordion) {
                // Verifica se o accordion está na posição correta relativa ao targetContainer
                const isPositionCorrect = finalConfig.insertBefore
                    ? targetContainer.previousElementSibling === existingAccordion
                    : targetContainer.nextElementSibling === existingAccordion;

                if (isPositionCorrect) {
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Accordion já existe na posição correta, pulando criação"
                    );
                    return true;
                } else {
                    // Accordion existe mas não está na posição correta - remove o antigo
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Accordion existe mas fora de posição, removendo antigo..."
                    );
                    if (existingAccordion.parentNode) {
                        existingAccordion.parentNode.removeChild(existingAccordion);
                    }
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Accordion antigo removido, criando novo..."
                    );
                }
            }

            // Verificação adicional: remove qualquer outro accordion que possa estar no local errado
            const allAccordions = document.querySelectorAll(
                `#${finalConfig.accordionId}`
            );
            if (allAccordions.length > 1) {
                console.warn(
                    `[CartCustomPlugin] Encontrados ${allAccordions.length} accordions com o mesmo ID, removendo duplicatas...`
                );
                for (let i = 1; i < allAccordions.length; i++) {
                    if (allAccordions[i].parentNode) {
                        allAccordions[i].parentNode.removeChild(allAccordions[i]);
                    }
                }
            }

            // Cria o elemento do accordion
            const accordion = document.createElement("div");
            accordion.id = finalConfig.accordionId;

            // Define o ícone inicial baseado no estado configurado
            const initialIcon = this.getAccordionIcon(
                finalConfig.initialState,
                finalConfig.customIcons
            );

            accordion.innerHTML = `
          <div class="accordion-container">
            <div class="accordion-toggle-container">
              <div class="accordion-toggle">
                <strong class="accordion-title">${finalConfig.title}</strong>
                ${initialIcon}
              </div>
              <p class="accordion-description">${finalConfig.description}</p>
              </div>
          </div>
      `;

            // Adiciona classe para controlar estado
            accordion.className = "shipping-accordion-container";

            // Adiciona classe expanded se o estado inicial for expandido
            if (finalConfig.initialState) {
                accordion.classList.add("expanded");
            }

            // Insere o accordion antes ou depois do container alvo
            if (finalConfig.insertBefore) {
                targetContainer.parentNode.insertBefore(accordion, targetContainer);
            } else {
                targetContainer.parentNode.insertBefore(
                    accordion,
                    targetContainer.nextSibling
                );
            }

            // Adiciona funcionalidade de clique
            this.setupAccordionFunctionality(accordion, targetContainer, finalConfig);

            // Registra o accordion no sistema de tracking
            this.registerAccordion(
                finalConfig.accordionId,
                finalConfig.targetSelector,
                accordion
            );

            // Adiciona classe para indicar que está sendo controlado por accordion
            targetContainer.classList.add("accordion-controlled");
            console.log(
                "[CartCustomPlugin] Classe 'accordion-controlled' adicionada ao target container"
            );

            console.log(
                "[CartCustomPlugin] Accordion criado e registrado com sucesso:",
                finalConfig.title
            );

            return {
                accordion,
                targetContainer,
                config: finalConfig,
            };
        } catch (error) {
            console.error("[CartCustomPlugin] Erro no core do accordion:", error);
            this.logError("createAccordionCore", error);
            throw error;
        }
    },
    /**
     * Configura funcionalidade do accordion
     */
    setupAccordionFunctionality: function (
        accordionElement,
        targetContainer,
        config
    ) {
        const toggleButton = accordionElement.querySelector(".accordion-toggle");
        const toggleIcon = accordionElement.querySelector(".accordion-toggle-icon");

        // Usa o estado inicial da configuração ou false por padrão
        let isExpanded = config ? config.initialState : false;

        // Estado inicial do container baseado na configuração
        if (isExpanded) {
            targetContainer.style.display = "block";
        } else {
            targetContainer.style.display = "none";
        }

        // Define o ícone inicial correto
        if (toggleIcon) {
            toggleIcon.innerHTML = this.getAccordionIcon(
                isExpanded,
                config ? config.customIcons : null
            );
        }

        // Adiciona event listener
        if (toggleButton) {
            toggleButton.addEventListener("click", () => {
                this.toggleAccordion(
                    accordionElement,
                    targetContainer,
                    toggleIcon,
                    config ? config.customIcons : null,
                    config ? config.exclusiveMode : false
                );
            });

            // Adiciona cursor pointer
            toggleButton.style.cursor = "pointer";
            toggleButton.style.userSelect = "none";
        }
    },
    /**
     * Alterna estado do accordion com animação suave
     */
    toggleAccordion: function (
        accordionElement,
        targetContainer,
        toggleIcon,
        customIcons,
        exclusiveMode = false
    ) {
        const isExpanded = accordionElement.classList.contains("expanded");

        if (isExpanded) {
            // Colapsar
            this.animateAccordion(targetContainer, false);
            accordionElement.classList.remove("expanded");
            if (toggleIcon) {
                toggleIcon.innerHTML = this.getAccordionIcon(false, customIcons);
            }
            checkoutCustom.utils.log("[CartCustomPlugin] Accordion colapsado");
        } else {
            // Se modo exclusivo estiver ativado, fecha todos os outros accordions
            if (exclusiveMode) {
                this.closeOtherAccordions(accordionElement);
            }

            // Expandir
            this.animateAccordion(targetContainer, true);
            accordionElement.classList.add("expanded");
            if (toggleIcon) {
                toggleIcon.innerHTML = this.getAccordionIcon(true, customIcons);
            }
            checkoutCustom.utils.log("[CartCustomPlugin] Accordion expandido");
        }
    },
    /**
     * Fecha todos os outros accordions quando um é expandido (modo exclusivo)
     */
    closeOtherAccordions: function (currentAccordion) {
        // Itera sobre todos os accordions registrados no sistema
        this.state.accordions.forEach((accordionData, accordionId) => {
            const accordion = accordionData.element;

            // Pula o accordion atual
            if (accordion === currentAccordion) {
                return;
            }

            // Se o accordion está expandido, fecha ele
            if (accordion && accordion.classList.contains("expanded")) {
                const targetSelector = accordionData.signature.targetSelector;
                const targetContainer = document.querySelector(targetSelector);
                const toggleIcon = accordion.querySelector(".accordion-toggle-icon");

                if (targetContainer) {
                    // Colapsa o accordion
                    this.animateAccordion(targetContainer, false);
                    accordion.classList.remove("expanded");

                    // Atualiza o ícone
                    if (toggleIcon) {
                        toggleIcon.innerHTML = this.getAccordionIcon(false);
                    }

                    console.log(
                        `[CartCustomPlugin] Accordion ${accordionId} fechado (modo exclusivo)`
                    );
                }
            }
        });
    },

    /**
     * Anima a expansão/colapso do accordion
     */
    animateAccordion: function (targetContainer, expand) {
        if (expand) {
            // Expandir com animação
            targetContainer.style.display = "block";
            targetContainer.style.maxHeight = "0px";
            targetContainer.style.overflow = "hidden";
            targetContainer.style.transition = "max-height 0.3s ease-in-out";

            // Força reflow
            targetContainer.offsetHeight;

            targetContainer.style.maxHeight = targetContainer.scrollHeight + "px";

            // Remove limites após animação
            setTimeout(() => {
                targetContainer.style.maxHeight = "none";
                targetContainer.style.overflow = "visible";
                targetContainer.style.transition = "";
            }, 300);
        } else {
            // Colapsar com animação
            targetContainer.style.maxHeight = targetContainer.scrollHeight + "px";
            targetContainer.style.overflow = "hidden";
            targetContainer.style.transition = "max-height 0.3s ease-in-out";

            // Força reflow
            targetContainer.offsetHeight;

            targetContainer.style.maxHeight = "0px";

            // Esconde após animação
            setTimeout(() => {
                targetContainer.style.display = "none";
                targetContainer.style.maxHeight = "none";
                targetContainer.style.overflow = "visible";
                targetContainer.style.transition = "";
            }, 300);
        }
    },
    /**
     * Método público para controlar accordion programaticamente
     */
    controlAccordion: function (action, customIcons = null) {
        const accordion = document.querySelector("#react-shipping-accordion");
        const container = document.querySelector("#shipping-preview-container");
        const toggleIcon = accordion
            ? accordion.querySelector(".accordion-toggle-icon")
            : null;

        if (!accordion || !container) {
            console.warn("[CartCustomPlugin] Accordion ou container não encontrado");
            return false;
        }

        switch (action) {
            case "expand":
            case "open":
                if (!accordion.classList.contains("expanded")) {
                    this.toggleAccordion(accordion, container, toggleIcon, customIcons);
                }
                return true;

            case "collapse":
            case "close":
                if (accordion.classList.contains("expanded")) {
                    this.toggleAccordion(accordion, container, toggleIcon, customIcons);
                }
                return true;

            case "toggle":
                this.toggleAccordion(accordion, container, toggleIcon, customIcons);
                return true;

            default:
                console.warn(
                    "[CartCustomPlugin] Ação inválida para accordion:",
                    action
                );
                return false;
        }
    },

    /**
     * Método de limpeza do plugin
     */
    destroy: function () {
        checkoutCustom.utils.log("[CartCustomPlugin] Iniciando limpeza...");

        try {
            // Limpa observadores
            if (this.cartObserver) {
                this.cartObserver.disconnect();
                this.cartObserver = null;
                checkoutCustom.utils.log("[CartCustomPlugin] Observador desconectado");
            }

            // Limpa timeouts
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
                this.updateTimeout = null;
            }

            // Limpa estado, sistema de tracking e observadores
            this.state = {
                accordions: new Map(),
                lastCleanup: 0,
                spaMode: true,
            };

            // Limpa sistema de observação de elementos
            if (
                window.checkoutCustom &&
                window.checkoutCustom.utils &&
                window.checkoutCustom.utils.elementObserver &&
                typeof window.checkoutCustom.utils.elementObserver.cleanup ===
                "function"
            ) {
                window.checkoutCustom.utils.elementObserver.cleanup();
            }

            // Remove elementos criados (opcional - pode ser perigoso)
            const frontContainer = document.querySelector(this.config.frontContainer);
            if (frontContainer && frontContainer.parentNode) {
                // Só remove se foi criado por nós (adicionar atributo de identificação)
                if (frontContainer.hasAttribute("data-cart-custom-created")) {
                    frontContainer.parentNode.removeChild(frontContainer);
                    checkoutCustom.utils.log(
                        "[CartCustomPlugin] Elementos criados removidos"
                    );
                }
            }

            // Remove accordions
            const accordions = document.querySelectorAll(
                "[id^='react-shipping-accordion']"
            );
            accordions.forEach((accordion) => {
                if (accordion && accordion.parentNode) {
                    accordion.parentNode.removeChild(accordion);
                }
            });

            // Remove classe accordion-controlled de todos os containers
            const controlledContainers = document.querySelectorAll(
                ".accordion-controlled"
            );
            controlledContainers.forEach((container) => {
                container.classList.remove("accordion-controlled");
            });

            checkoutCustom.utils.log(
                "[CartCustomPlugin] Accordions removidos e classes limpas"
            );

            checkoutCustom.utils.log("[CartCustomPlugin] Limpeza completa realizada");
        } catch (error) {
            console.error("[CartCustomPlugin] Erro durante limpeza:", error);
        }

        checkoutCustom.utils.log("[CartCustomPlugin] Destruído");
    },
};

const CheckoutCustom = (function () {
    "use strict";

    // Configurações globais
    const config = {
        debug: true,
        selectors: {
            checkoutContainer: "#checkout-container",
            orderForm: "#checkout-order-form",
            shippingData: ".shipping-data",
            paymentData: ".payment-data",
            clientProfileData: ".client-profile-data",
            orderPlaced: ".order-placed",
            summary: ".summary-container",
        },
        events: {
            onInit: "checkoutCustom:init",
            onPageChange: "checkoutCustom:pageChange",
            onOrderFormUpdate: "checkoutCustom:orderFormUpdate",
            onShippingChange: "checkoutCustom:shippingChange",
            onPaymentChange: "checkoutCustom:paymentChange",
        },
        timeouts: {
            debounce: 300,
            retry: 1000,
        },
    };

    // Estado da aplicação
    const state = {
        currentPage: "",
        orderForm: null,
        isInitialized: false,
        plugins: new Map(),
        orderFormLastUpdate: null,
        hooks: {
            beforeInit: [],
            afterInit: [],
            beforePageChange: [],
            afterPageChange: [],
            onOrderFormUpdate: [],
        },
    };

    // Utilitários
    const utils = {
        /**
         * Log condicional baseado na configuração de debug
         */
        log: function (...args) {
            if (config.debug) {
                console.log("[CheckoutCustom]", ...args);
            }
        },

        /**
         * Debounce para otimizar performance
         */
        debounce: function (func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Verifica se elemento existe no DOM
         */
        elementExists: function (selector) {
            return document.querySelector(selector) !== null;
        },

        /**
         * Sistema avançado de observação de elementos dinâmicos
         */
        elementObserver: {
            observers: new Map(),
            pendingTasks: new Map(),

            // Referência para o contexto do elementObserver
            self: null,

            /**
             * Observa continuamente um elemento específico
             */
            observeElement: function (selector, callback, options = {}) {
                // Armazena referência para o contexto correto
                const self = (this.self = this);
                const defaultOptions = {
                    timeout: 15000, // 15 segundos
                    retryInterval: 500, // verificar a cada 500ms
                    maxRetries: 30,
                    persistent: true, // continuar observando mesmo após encontrar
                };

                const config = { ...defaultOptions, ...options };
                let retryCount = 0;
                let timeoutId;
                let observer;

                const checkElement = () => {
                    const element = document.querySelector(selector);
                    if (element) {
                        console.log(
                            `[ElementObserver] Elemento ${selector} encontrado após ${retryCount} tentativas`
                        );
                        callback(element);

                        if (!config.persistent) {
                            self.stopObserving(selector);
                            if (timeoutId) clearTimeout(timeoutId);
                        }
                        return true;
                    }
                    return false;
                };

                const startObserving = () => {
                    // Verificação inicial
                    if (checkElement()) return;

                    // Configura observer de mutação
                    observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (
                                mutation.type === "childList" &&
                                mutation.addedNodes.length > 0
                            ) {
                                // Verifica se algum nó adicionado contém o elemento desejado
                                const hasTargetElement = Array.from(mutation.addedNodes).some(
                                    (node) => {
                                        if (node.nodeType === Node.ELEMENT_NODE) {
                                            return (
                                                node.matches &&
                                                (node.matches(selector) || node.querySelector(selector))
                                            );
                                        }
                                        return false;
                                    }
                                );

                                if (hasTargetElement && checkElement()) {
                                    return;
                                }
                            }
                        });
                    });

                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: false,
                    });

                    // Sistema de retry com backoff exponencial
                    const retryWithBackoff = () => {
                        retryCount++;
                        const delay = Math.min(
                            config.retryInterval * Math.pow(1.2, retryCount),
                            2000
                        ); // max 2s

                        timeoutId = setTimeout(() => {
                            if (retryCount >= config.maxRetries) {
                                console.warn(
                                    `[ElementObserver] Timeout aguardando ${selector} após ${config.maxRetries} tentativas`
                                );
                                self.stopObserving(selector);
                                return;
                            }

                            if (!checkElement()) {
                                retryWithBackoff();
                            }
                        }, delay);
                    };

                    retryWithBackoff();
                };

                // Armazena a configuração
                self.observers.set(selector, {
                    observer,
                    timeoutId,
                    callback,
                    config,
                });

                startObserving();

                return selector;
            },

            /**
             * Para de observar um elemento específico
             */
            stopObserving: function (selector) {
                const observation = this.observers.get(selector);
                if (observation) {
                    if (observation.observer) {
                        observation.observer.disconnect();
                    }
                    if (observation.timeoutId) {
                        clearTimeout(observation.timeoutId);
                    }
                    this.observers.delete(selector);
                    console.log(`[ElementObserver] Parou de observar: ${selector}`);
                }
            },

            /**
             * Adiciona tarefa pendente para executar quando elemento estiver disponível
             */
            addPendingTask: function (selector, task, options = {}) {
                // Garante que temos a referência do contexto
                const self = this.self || this;

                if (!self.pendingTasks.has(selector)) {
                    self.pendingTasks.set(selector, []);
                }

                self.pendingTasks.get(selector).push({ task, options });

                // Inicia observação se não estiver ativa
                if (!self.observers.has(selector)) {
                    self.observeElement(
                        selector,
                        (element) => {
                            self.executePendingTasks(selector, element);
                        },
                        options
                    );
                } else {
                    // Se já está observando, verifica se elemento já existe
                    const element = document.querySelector(selector);
                    if (element) {
                        self.executePendingTasks(selector, element);
                    }
                }
            },

            /**
             * Executa tarefas pendentes para um elemento
             */
            executePendingTasks: function (selector, element) {
                // Garante que temos a referência do contexto
                const self = this.self || this;

                const tasks = self.pendingTasks.get(selector);
                if (!tasks) return;

                console.log(
                    `[ElementObserver] Executando ${tasks.length} tarefas pendentes para ${selector}`
                );

                tasks.forEach(({ task }) => {
                    try {
                        task(element);
                    } catch (error) {
                        console.error(
                            `[ElementObserver] Erro executando tarefa pendente para ${selector}:`,
                            error
                        );
                    }
                });

                // Remove tarefas executadas
                self.pendingTasks.delete(selector);
            },

            /**
             * Limpa todas as observações e tarefas pendentes
             */
            cleanup: function () {
                // Garante que temos a referência do contexto
                const self = this.self || this;

                self.observers.forEach((observation, selector) => {
                    self.stopObserving(selector);
                });
                self.pendingTasks.clear();
                console.log("[ElementObserver] Limpeza completa realizada");
            },
        },

        /**
         * Aguarda elemento aparecer no DOM (versão melhorada)
         */
        waitForElement: function (selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                // Verificação imediata
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                // Timeout aumentado para SPAs
                const startTime = Date.now();

                const observer = new MutationObserver(() => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed > timeout) {
                        observer.disconnect();
                        reject(
                            new Error(`Elemento ${selector} não encontrado após ${timeout}ms`)
                        );
                        return;
                    }

                    const foundElement = document.querySelector(selector);
                    if (foundElement) {
                        observer.disconnect();
                        resolve(foundElement);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ["class", "id", "style"],
                });

                // Timeout de segurança
                setTimeout(() => {
                    observer.disconnect();
                    reject(
                        new Error(`Elemento ${selector} não encontrado após ${timeout}ms`)
                    );
                }, timeout);
            });
        },

        /**
         * Formata valores monetários
         */
        formatCurrency: function (value, currency = "BRL") {
            if (value === null || value === undefined || isNaN(value)) {
                return "R$ 0,00";
            }

            // Converte para número se for string
            const numericValue =
                typeof value === "string" ? parseFloat(value) : value;

            // Se for valor em centavos (VTEX padrão), converte para reais
            const displayValue =
                numericValue > 100 ? numericValue / 100 : numericValue;

            return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: currency,
            }).format(displayValue);
        },

        /**
         * Verifica se o dispositivo é mobile
         */
        isMobile: function () {
            // Verificações de user agent
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = [
                "android",
                "webos",
                "iphone",
                "ipad",
                "ipod",
                "blackberry",
                "windows phone",
                "opera mini",
                "mobile",
                "tablet",
            ];

            const isMobileUserAgent = mobileKeywords.some((keyword) =>
                userAgent.includes(keyword)
            );

            // Verificação de tela touch
            const hasTouchScreen =
                "ontouchstart" in window ||
                navigator.maxTouchPoints > 0 ||
                navigator.msMaxTouchPoints > 0;

            // Verificação de largura da tela
            const screenWidth =
                window.innerWidth ||
                document.documentElement.clientWidth ||
                document.body.clientWidth;

            const isSmallScreen = screenWidth < 768;

            // Combina as verificações
            return isMobileUserAgent || (hasTouchScreen && isSmallScreen);
        },

        /**
         * Verifica se é tablet (dispositivo intermediário)
         */
        isTablet: function () {
            const screenWidth =
                window.innerWidth ||
                document.documentElement.clientWidth ||
                document.body.clientWidth;

            const userAgent = navigator.userAgent.toLowerCase();
            const isTabletUserAgent =
                userAgent.includes("ipad") ||
                (userAgent.includes("android") && !userAgent.includes("mobile"));

            return isTabletUserAgent || (screenWidth >= 768 && screenWidth < 1024);
        },

        /**
         * Retorna informações sobre o dispositivo
         */
        getDeviceInfo: function () {
            const isMobile = this.isMobile();
            const isTablet = this.isTablet();
            const screenWidth =
                window.innerWidth ||
                document.documentElement.clientWidth ||
                document.body.clientWidth;

            return {
                isMobile: isMobile,
                isTablet: isTablet,
                isDesktop: !isMobile && !isTablet,
                screenWidth: screenWidth,
                hasTouchScreen:
                    "ontouchstart" in window ||
                    navigator.maxTouchPoints > 0 ||
                    navigator.msMaxTouchPoints > 0,
                userAgent: navigator.userAgent,
            };
        },

        /**
         * Extrai o tamanho do produto do selectedOptions ou do nome
         * @param {Object} item - Item do carrinho
         * @returns {string} - Tamanho do produto ou "U" se não encontrado
         */
        extractProductSize: function (item) {
            if (!item) return 'U';

            // Primeiro tenta pegar do selectedOptions
            const sizeFromOptions = item.selectedOptions?.find((option) => option.id === "Size")?.value;
            if (sizeFromOptions) {
                return sizeFromOptions;
            }

            // Se não encontrou, tenta extrair do nome do produto
            const productName = item.name || '';

            // Regex para encontrar tamanhos comuns (palavras completas)
            const sizeRegex = /\b(ÚNICO|UNICO|P|M|G|GG|XG|XXG|XXXG|PP|U)\b/gi;

            // Também busca por números de tamanho (36, 38, 40, etc.)
            const numberSizeRegex = /\b(3[6-9]|4[0-9]|5[0-9]|6[0-9])\b/g;

            // Verifica primeiro se contém ÚNICO (prioridade máxima)
            if (productName.toUpperCase().includes('ÚNICO')) {
                return 'ÚNICO';
            }
            if (productName.toUpperCase().includes('UNICO')) {
                return 'UNICO';
            }

            // Tenta encontrar outros tamanhos por regex
            let sizeMatch = productName.match(sizeRegex);
            if (sizeMatch) {
                const lastMatch = sizeMatch[sizeMatch.length - 1];
                return lastMatch.toUpperCase();
            }

            // Tenta encontrar tamanho numérico
            sizeMatch = productName.match(numberSizeRegex);
            if (sizeMatch) {
                return sizeMatch[sizeMatch.length - 1]; // Pega o último match encontrado
            }

            // Se não encontrou nenhum tamanho, retorna "U" (único)
            return 'U';
        },

        /**
         * Converte URL de imagem VTEX para um tamanho específico
         * Remove parâmetros de query e altera dimensões
         * @param {string} imageUrl - URL original da imagem
         * @param {string} size - Novo tamanho no formato "largura-altura" (ex: "200-200")
         * @returns {string} - URL convertida
         */
        convertImageUrl: function (imageUrl, size = "200-200") {
            if (!imageUrl || typeof imageUrl !== "string") {
                return imageUrl;
            }

            try {
                // Remove parâmetros de query se existirem
                const urlWithoutQuery = imageUrl.split('?')[0];

                // Regex para encontrar o padrão de tamanho na URL VTEX
                // Exemplo: /ids/155418-55-55/ -> /ids/155418-200-200/
                const sizeRegex = /-(\d+)-(\d+)\//;

                if (sizeRegex.test(urlWithoutQuery)) {
                    return urlWithoutQuery.replace(sizeRegex, `-${size}/`);
                }

                // Se não encontrar padrão de tamanho, retorna a URL sem query
                return urlWithoutQuery;
            } catch (error) {
                this.log("Erro ao converter URL da imagem:", error);
                return imageUrl;
            }
        },

        /**
         * Cache para armazenar imagens thumb dos SKUs
         */
        thumbImageCache: {},

        /**
         * Busca a imagem com label "thumb" de um SKU
         * @param {string} skuId - ID do SKU
         * @returns {Promise<string|null>} - URL da imagem thumb ou null se não encontrar
         */
        getThumbImage: async function (skuId) {
            // Verifica se já está no cache (pode ser null se não tem thumb)
            if (this.thumbImageCache.hasOwnProperty(skuId)) {
                return this.thumbImageCache[skuId];
            }

            try {
                const response = await fetch(`/api/catalog_system/pub/products/search?fq=skuId:${skuId}`);
                const data = await response.json();

                if (data && data.length > 0 && data[0].items && data[0].items.length > 0) {
                    const item = data[0].items.find(i => i.itemId === skuId);
                    if (item && item.images && item.images.length > 0) {
                        // Procura por imagem com label "thumb"
                        const thumbImage = item.images.find(img => img.imageLabel === "thumb");
                        if (thumbImage) {
                            this.thumbImageCache[skuId] = thumbImage.imageUrl;
                            return thumbImage.imageUrl;
                        }
                    }
                }
            } catch (error) {
                this.log("Erro ao buscar imagem thumb:", error);
            }

            // Salva null no cache para não buscar novamente
            this.thumbImageCache[skuId] = null;
            return null;
        },

        /**
         * Obtém a URL da imagem thumb de um item do carrinho
         * Retorna string vazia se não houver imagem com label "thumb"
         * @param {object} item - Item do carrinho
         * @returns {string} - URL da imagem thumb ou string vazia
         */
        getItemThumbImageUrl: function (item) {
            // Retorna string vazia inicialmente e atualiza assincronamente
            const defaultUrl = '';

            // Busca a imagem thumb assincronamente
            this.getThumbImage(item?.id).then(thumbUrl => {
                const itemContainer = document.querySelector(`[data-skuid="${item?.id}"]`);
                if (!itemContainer) return;

                const colorImages = itemContainer.querySelectorAll('.front-container-color, .front-container-product-color-mobile');
                const firstSeparator = itemContainer.querySelector('.front-container-product-separetor');

                if (thumbUrl) {
                    // Se encontrou thumb, atualiza a imagem e mostra o primeiro separador
                    colorImages.forEach(img => {
                        img.src = thumbUrl;
                        img.style.display = '';
                    });
                    if (firstSeparator) {
                        firstSeparator.style.display = '';
                    }
                } else {
                    // Se não encontrou thumb, esconde a imagem e o primeiro separador
                    colorImages.forEach(img => {
                        img.style.display = 'none';
                    });
                    if (firstSeparator) {
                        firstSeparator.style.display = 'none';
                    }
                }
            });

            return defaultUrl;
        },
    };

    // Sistema de eventos
    const events = {
        listeners: {},

        /**
         * Registra um listener para um evento
         */
        on: function (event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },

        /**
         * Remove um listener
         */
        off: function (event, callback) {
            if (this.listeners[event]) {
                this.listeners[event] = this.listeners[event].filter(
                    (cb) => cb !== callback
                );
            }
        },

        /**
         * Dispara um evento
         */
        emit: function (event, data = {}) {
            utils.log(`Evento disparado: ${event}`, data);

            if (this.listeners[event]) {
                this.listeners[event].forEach((callback) => {
                    try {
                        callback(data);
                    } catch (error) {
                        utils.log(`Erro no callback do evento ${event}:`, error);
                    }
                });
            }

            // Dispara evento custom no DOM
            const customEvent = new CustomEvent(event, { detail: data });
            document.dispatchEvent(customEvent);
        },
    };

    // Gerenciador de páginas
    const pageManager = {
        pages: {
            cart: "container-cart",
            profile: "client-profile-data",
            shipping: "shipping-data",
            payment: "payment-data",
            confirmation: "order-placed",
            email: "email-data",
        },

        /**
         * Detecta a página atual do checkout
         */
        detectCurrentPage: function () {
            const hash = window.location.hash.substring(1).split("/")[1];

            // Verifica se estamos na página de confirmação
            if (utils.elementExists(config.selectors.orderPlaced)) {
                return "confirmation";
            }

            if (hash) {
                for (const [page, selector] of Object.entries(this.pages)) {
                    if (hash === page) {
                        return page;
                    }
                }
            }

            // Verifica hash da URL
            if (hash) {
                for (const [page, selector] of Object.entries(this.pages)) {
                    if (hash.includes(selector)) {
                        return page;
                    }
                }
            }

            // Fallback: verifica elementos visíveis
            for (const [page, selector] of Object.entries(this.pages)) {
                if (
                    utils.elementExists(selector) &&
                    !document.querySelector(selector).classList.contains("sr-hide")
                ) {
                    return page;
                }
            }

            return "unknown";
        },

        /**
         * Navega para uma página específica
         */
        navigateTo: function (page) {
            const selector = this.pages[page];
            if (selector) {
                window.location.hash = `#/${selector}`;
            }
        },

        /**
         * Manipula mudanças de página
         */
        handlePageChange: function (newPage) {
            if (state.currentPage !== newPage) {
                utils.log(`Página mudou: ${state.currentPage} -> ${newPage}`);

                // Executa hooks before
                state.hooks.beforePageChange.forEach((hook) =>
                    hook(state.currentPage, newPage)
                );

                // Dispara evento
                events.emit(config.events.onPageChange, {
                    from: state.currentPage,
                    to: newPage,
                });

                state.currentPage = newPage;

                // Executa hooks after
                state.hooks.afterPageChange.forEach((hook) => hook(newPage));
            }
        },
    };

    // Gerenciador do OrderForm
    const orderFormManager = {
        /**
         * Atualiza o orderForm no estado
         */
        updateOrderForm: function (orderForm) {
            if (!orderForm) {
                console.warn(
                    "[CheckoutCustom] Tentativa de atualizar orderForm com valor nulo"
                );
                return;
            }

            const previousOrderForm = state.orderForm;
            state.orderForm = orderForm;
            state.orderFormLastUpdate = Date.now();

            utils.log(
                `[CheckoutCustom] OrderForm atualizado - ${orderForm.items?.length || 0
                } itens`
            );
            events.emit(config.events.onOrderFormUpdate, orderForm);

            // Executa hooks de atualização do orderForm
            state.hooks.onOrderFormUpdate.forEach((hook) => {
                try {
                    hook(orderForm, previousOrderForm);
                } catch (error) {
                    utils.log(`[CheckoutCustom] Erro no hook onOrderFormUpdate:`, error);
                }
            });
        },

        /**
         * Obtém dados específicos do orderForm
         */
        getData: function (path) {
            if (!state.orderForm) return null;

            return path.split(".").reduce((obj, key) => obj?.[key], state.orderForm);
        },

        /**
         * Calcula o total do pedido
         */
        getTotal: function () {
            const total = this.getData("value");
            return total;
        },

        /**
         * Obtém o orderForm atual
         */
        getOrderForm: function () {
            return state.orderForm;
        },

        /**
         * Verifica se o orderForm foi carregado
         */
        hasOrderForm: function () {
            return state.orderForm !== null;
        },

        /**
         * Obtém informações sobre a última atualização
         */
        getLastUpdate: function () {
            return {
                timestamp: state.orderFormLastUpdate,
                timeAgo: state.orderFormLastUpdate
                    ? Date.now() - state.orderFormLastUpdate
                    : null,
            };
        },

        /**
         * Força recarregamento do orderForm da VTEX
         */
        refreshOrderForm: async function () {
            try {
                if (window.vtexjs && window.vtexjs.checkout) {
                    const orderForm = await window.vtexjs.checkout.getOrderForm();
                    this.updateOrderForm(orderForm);
                    return orderForm;
                } else {
                    console.warn(
                        "[CheckoutCustom] VTEX checkout não disponível para refresh"
                    );
                    return null;
                }
            } catch (error) {
                console.error(
                    "[CheckoutCustom] Erro ao fazer refresh do orderForm:",
                    error
                );
                throw error;
            }
        },
    };

    // Sistema de plugins
    const pluginManager = {
        /**
         * Registra um plugin
         */
        register: function (name, plugin) {
            if (state.plugins.has(name)) {
                utils.log(`Plugin ${name} já registrado, sobrescrevendo...`);
            }

            state.plugins.set(name, plugin);

            // Inicializa plugin se checkout já estiver pronto
            if (state.isInitialized && plugin.init) {
                plugin.init();
            }

            utils.log(`Plugin ${name} registrado com sucesso`);
        },

        /**
         * Remove um plugin
         */
        unregister: function (name) {
            if (state.plugins.has(name)) {
                const plugin = state.plugins.get(name);
                if (plugin.destroy) {
                    plugin.destroy();
                }
                state.plugins.delete(name);
                utils.log(`Plugin ${name} removido`);
            }
        },

        /**
         * Executa um método em todos os plugins
         */
        executeOnAll: function (methodName, ...args) {
            state.plugins.forEach((plugin, name) => {
                if (plugin[methodName]) {
                    try {
                        plugin[methodName](...args);
                    } catch (error) {
                        utils.log(`Erro no plugin ${name}, método ${methodName}:`, error);
                    }
                }
            });
        },
    };

    // API pública
    const api = {
        // Configuração
        config: config,
        setConfig: function (newConfig) {
            Object.assign(config, newConfig);
        },

        // Estado
        getState: function () {
            return { ...state };
        },

        // Utilitários
        utils: utils,
        formatCurrency: utils.formatCurrency.bind(utils),

        // Eventos
        on: events.on.bind(events),
        off: events.off.bind(events),
        emit: events.emit.bind(events),

        // Páginas
        getCurrentPage: function () {
            return state.currentPage;
        },
        navigateTo: pageManager.navigateTo.bind(pageManager),

        // OrderForm
        getOrderForm: orderFormManager.getOrderForm.bind(orderFormManager),
        getOrderFormData: orderFormManager.getData.bind(orderFormManager),
        getTotal: orderFormManager.getTotal.bind(orderFormManager),
        hasOrderForm: orderFormManager.hasOrderForm.bind(orderFormManager),
        refreshOrderForm: orderFormManager.refreshOrderForm.bind(orderFormManager),
        getOrderFormLastUpdate:
            orderFormManager.getLastUpdate.bind(orderFormManager),

        // Plugins
        registerPlugin: pluginManager.register.bind(pluginManager),
        unregisterPlugin: pluginManager.unregister.bind(pluginManager),

        // Hooks
        addHook: function (type, callback) {
            if (state.hooks[type]) {
                state.hooks[type].push(callback);
            }
        },
        removeHook: function (type, callback) {
            if (state.hooks[type]) {
                state.hooks[type] = state.hooks[type].filter((cb) => cb !== callback);
            }
        },

        // Métodos principais
        init: function () {
            if (state.isInitialized) {
                utils.log("CheckoutCustom já foi inicializado");
                return;
            }

            utils.log("Inicializando CheckoutCustom...");

            // Executa hooks beforeInit
            state.hooks.beforeInit.forEach((hook) => hook());

            // Detecta página inicial
            state.currentPage = pageManager.detectCurrentPage();

            // Configura observadores
            this.setupObservers();

            // Configura event listeners
            this.setupEventListeners();

            // Inicializa plugins
            pluginManager.executeOnAll("init");

            state.isInitialized = true;

            // Dispara evento de inicialização
            events.emit(config.events.onInit, {
                page: state.currentPage,
                timestamp: Date.now(),
            });

            // Executa hooks afterInit
            state.hooks.afterInit.forEach((hook) => hook());

            utils.log("CheckoutCustom inicializado com sucesso");
        },

        /**
         * Configura observadores para mudanças no DOM
         */
        setupObservers: function () {
            // Observa mudanças no hash da URL
            const handleHashChange = utils.debounce(() => {
                const newPage = pageManager.detectCurrentPage();
                pageManager.handlePageChange(newPage);
            }, config.timeouts.debounce);

            window.addEventListener("hashchange", handleHashChange);

            // Observa mudanças no orderForm (se disponível via VTEX)
            if (window.vtex && window.vtex.checkout) {
                // Hook para orderForm updates
                const originalOrderFormUpdate = window.vtex.checkout.onOrderFormUpdated;
                window.vtex.checkout.onOrderFormUpdated = function (orderForm) {
                    orderFormManager.updateOrderForm(orderForm);
                    if (originalOrderFormUpdate) {
                        originalOrderFormUpdate(orderForm);
                    }
                };
            }
        },

        /**
         * Configura event listeners
         */
        setupEventListeners: function () {
            // Listener para mudanças no DOM do checkout
            const checkoutContainer = document.querySelector(
                config.selectors.checkoutContainer
            );
            if (checkoutContainer) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (
                            mutation.type === "childList" &&
                            mutation.addedNodes.length > 0
                        ) {
                            // Verifica se uma nova página foi carregada
                            const newPage = pageManager.detectCurrentPage();
                            if (newPage !== state.currentPage) {
                                pageManager.handlePageChange(newPage);
                            }
                        }
                    });
                });

                observer.observe(checkoutContainer, {
                    childList: true,
                    subtree: true,
                });
            }

            // Listener para evento orderFormUpdated.vtex da VTEX
            this.setupOrderFormListeners();
        },

        /**
         * Configura listeners para o orderForm da VTEX
         */
        setupOrderFormListeners: function () {
            // Listener para evento jQuery orderFormUpdated.vtex
            if (window.jQuery || window.$) {
                $(window).on("orderFormUpdated.vtex", (evt, orderForm) => {
                    utils.log("[CheckoutCustom] OrderForm atualizado via evento VTEX");
                    orderFormManager.updateOrderForm(orderForm);
                });
            }

            // Listener alternativo para evento custom
            window.addEventListener("orderFormUpdated", (event) => {
                utils.log("[CheckoutCustom] OrderForm atualizado via evento custom");
                if (event.detail) {
                    orderFormManager.updateOrderForm(event.detail);
                }
            });

            // Hook para VTEX checkout se disponível
            if (window.vtex && window.vtex.checkout) {
                const originalOrderFormUpdate = window.vtex.checkout.onOrderFormUpdated;
                window.vtex.checkout.onOrderFormUpdated = function (orderForm) {
                    orderFormManager.updateOrderForm(orderForm);
                    if (originalOrderFormUpdate) {
                        originalOrderFormUpdate(orderForm);
                    }
                };
            }

            // Hook para vtexjs se disponível
            if (window.vtexjs && window.vtexjs.checkout) {
                const originalOrderFormUpdate =
                    window.vtexjs.checkout.onOrderFormUpdated;
                window.vtexjs.checkout.onOrderFormUpdated = function (orderForm) {
                    orderFormManager.updateOrderForm(orderForm);
                    if (originalOrderFormUpdate) {
                        originalOrderFormUpdate(orderForm);
                    }
                };
            }
        },

        /**
         * Inicializa o orderForm da VTEX
         */
        initializeOrderForm: async function () {
            try {
                utils.log("[CheckoutCustom] Inicializando orderForm...");

                // Tenta carregar via vtexjs primeiro
                if (window.vtexjs && window.vtexjs.checkout) {
                    const orderForm = await window.vtexjs.checkout.getOrderForm();
                    orderFormManager.updateOrderForm(orderForm);
                    utils.log("[CheckoutCustom] OrderForm inicial carregado via vtexjs");
                    return;
                }

                // Fallback para VTEX checkout
                if (window.vtex && window.vtex.checkout) {
                    const orderForm = await window.vtex.checkout.getOrderForm();
                    orderFormManager.updateOrderForm(orderForm);
                    utils.log(
                        "[CheckoutCustom] OrderForm inicial carregado via VTEX checkout"
                    );
                    return;
                }

                // Último fallback - tenta buscar via API
                const response = await fetch("/api/checkout/pub/orderForm", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const orderForm = await response.json();
                    orderFormManager.updateOrderForm(orderForm);
                    utils.log("[CheckoutCustom] OrderForm inicial carregado via API");
                } else {
                    utils.log(
                        "[CheckoutCustom] Não foi possível carregar orderForm inicial"
                    );
                }
            } catch (error) {
                utils.log(
                    "[CheckoutCustom] Erro ao inicializar orderForm:",
                    error.message
                );
                // Não lança erro para não quebrar a inicialização
            }
        },

        /**
         * Adiciona cupom de desconto usando VTEX checkout
         * @param {string} couponCode - Código do cupom
         * @returns {Promise} Promise com o orderForm atualizado
         */
        addDiscountCoupon: function (couponCode) {
            return new Promise((resolve, reject) => {
                // Verifica se vtexjs está disponível
                if (!window.vtexjs || !window.vtexjs.checkout) {
                    reject(new Error("VTEX checkout não está disponível"));
                    return;
                }

                utils.log(`[CheckoutCustom] Adicionando cupom: ${couponCode}`);

                try {
                    // Primeiro obtém o orderForm atual
                    window.vtexjs.checkout
                        .getOrderForm()
                        .done(function (orderForm) {
                            utils.log(
                                "[CheckoutCustom] OrderForm obtido, aplicando cupom..."
                            );

                            // Aplica o cupom
                            window.vtexjs.checkout
                                .addDiscountCoupon(couponCode)
                                .done(function (updatedOrderForm) {
                                    utils.log(
                                        "[CheckoutCustom] Cupom aplicado com sucesso",
                                        updatedOrderForm
                                    );

                                    // Atualiza o orderForm no estado interno
                                    orderFormManager.updateOrderForm(updatedOrderForm);

                                    // Dispara evento custom para plugins
                                    window.dispatchEvent(
                                        new CustomEvent("couponApplied", {
                                            detail: {
                                                couponCode: couponCode,
                                                orderForm: updatedOrderForm,
                                            },
                                        })
                                    );

                                    resolve(updatedOrderForm);
                                })
                                .fail(function (error) {
                                    utils.log("[CheckoutCustom] Erro ao aplicar cupom:", error);
                                    reject(error);
                                });
                        })
                        .fail(function (error) {
                            utils.log("[CheckoutCustom] Erro ao obter orderForm:", error);
                            reject(error);
                        });
                } catch (error) {
                    utils.log("[CheckoutCustom] Erro inesperado:", error);
                    reject(error);
                }
            });
        },

        /**
         * Remove itens do carrinho usando VTEX checkout
         * @param {Array} itemsToRemove - Array de objetos com index e quantity
         * @returns {Promise} Promise com o orderForm atualizado
         */
        removeCartItem: function (itemsToRemove) {
            return new Promise((resolve, reject) => {
                // Verifica se vtexjs está disponível
                if (!window.vtexjs || !window.vtexjs.checkout) {
                    reject(new Error("VTEX checkout não está disponível"));
                    return;
                }

                utils.log(
                    `[CheckoutCustom] Removendo itens do carrinho:`,
                    itemsToRemove
                );

                try {
                    // Primeiro obtém o orderForm atual
                    window.vtexjs.checkout
                        .getOrderForm()
                        .done(function (orderForm) {
                            utils.log(
                                "[CheckoutCustom] OrderForm obtido, removendo itens..."
                            );

                            // Remove os itens
                            window.vtexjs.checkout
                                .removeItems(itemsToRemove)
                                .done(function (updatedOrderForm) {
                                    utils.log(
                                        "[CheckoutCustom] Itens removidos com sucesso",
                                        updatedOrderForm
                                    );

                                    // Atualiza o orderForm no estado interno
                                    orderFormManager.updateOrderForm(updatedOrderForm);

                                    // Dispara evento custom para plugins
                                    window.dispatchEvent(
                                        new CustomEvent("cartItemRemoved", {
                                            detail: {
                                                removedItems: itemsToRemove,
                                                orderForm: updatedOrderForm,
                                            },
                                        })
                                    );

                                    resolve(updatedOrderForm);
                                })
                                .fail(function (error) {
                                    utils.log("[CheckoutCustom] Erro ao remover itens:", error);
                                    reject(error);
                                });
                        })
                        .fail(function (error) {
                            utils.log("[CheckoutCustom] Erro ao obter orderForm:", error);
                            reject(error);
                        });
                } catch (error) {
                    utils.log("[CheckoutCustom] Erro inesperado:", error);
                    reject(error);
                }
            });
        },

        /**
         * Atualiza a quantidade de um item no carrinho usando VTEX checkout
         * @param {number} itemIndex - Índice do item no carrinho
         * @param {number} newQuantity - Nova quantidade do item
         * @returns {Promise} Promise com o orderForm atualizado
         */
        updateCartItemQuantity: function (itemIndex, newQuantity) {
            return new Promise((resolve, reject) => {
                // Verifica se vtexjs está disponível
                if (!window.vtexjs || !window.vtexjs.checkout) {
                    reject(new Error("VTEX checkout não está disponível"));
                    return;
                }

                utils.log(
                    `[CheckoutCustom] Atualizando quantidade do item ${itemIndex} para ${newQuantity}`
                );

                try {
                    // Primeiro obtém o orderForm atual
                    window.vtexjs.checkout
                        .getOrderForm()
                        .done(function (orderForm) {
                            utils.log(
                                "[CheckoutCustom] OrderForm obtido, atualizando quantidade..."
                            );

                            // Atualiza a quantidade do item
                            window.vtexjs.checkout
                                .updateItems([
                                    {
                                        index: itemIndex,
                                        quantity: newQuantity,
                                    },
                                ])
                                .done(function (updatedOrderForm) {
                                    utils.log(
                                        "[CheckoutCustom] Quantidade atualizada com sucesso",
                                        updatedOrderForm
                                    );

                                    // Atualiza o orderForm no estado interno
                                    orderFormManager.updateOrderForm(updatedOrderForm);

                                    // Dispara evento custom para plugins
                                    window.dispatchEvent(
                                        new CustomEvent("cartItemQuantityUpdated", {
                                            detail: {
                                                itemIndex: itemIndex,
                                                newQuantity: newQuantity,
                                                orderForm: updatedOrderForm,
                                            },
                                        })
                                    );

                                    resolve(updatedOrderForm);
                                })
                                .fail(function (error) {
                                    utils.log("[CheckoutCustom] Erro ao atualizar quantidade:", error);
                                    reject(error);
                                });
                        })
                        .fail(function (error) {
                            utils.log("[CheckoutCustom] Erro ao obter orderForm:", error);
                            reject(error);
                        });
                } catch (error) {
                    utils.log("[CheckoutCustom] Erro inesperado:", error);
                    reject(error);
                }
            });
        },

        /**
         * Método para destruir a instância
         */
        /**
         * Obtém e formata a estimativa de entrega do item no estilo VTEX
         * @param {Object} orderForm - OrderForm do VTEX checkout
         * @param {number} itemIndex - Índice do item no carrinho (opcional)
         * @returns {string} Texto formatado (ex: "Em até 5 dias úteis") ou "A Calcular"
         */
        getShippingEstimatedDate: function (orderForm, itemIndex = 0) {
            try {
                // Verifica se orderForm existe
                if (!orderForm || !orderForm.shippingData) {
                    utils.log("[CheckoutCustom] OrderForm ou shippingData não disponível");
                    return "A Calcular";
                }

                const shippingData = orderForm.shippingData;
                const logisticsInfo = shippingData.logisticsInfo;

                // Verifica se existe informações de logística
                if (!logisticsInfo || !Array.isArray(logisticsInfo) || logisticsInfo.length === 0) {
                    utils.log("[CheckoutCustom] Não há informações de logística disponíveis");
                    return "A Calcular";
                }

                // Obtém as informações de logística do item específico
                const itemLogistics = logisticsInfo[itemIndex] || logisticsInfo[0];

                if (!itemLogistics || !itemLogistics.slas || !Array.isArray(itemLogistics.slas)) {
                    utils.log("[CheckoutCustom] Não há SLAs disponíveis para o item");
                    return "A Calcular";
                }

                // Procura pelo SLA selecionado ou o primeiro disponível
                const selectedSla = itemLogistics.slas.find(sla => sla.id === itemLogistics.selectedSla) || itemLogistics.slas[0];

                if (!selectedSla || !selectedSla.shippingEstimate) {
                    utils.log("[CheckoutCustom] Não há estimativa de entrega disponível");
                    return "A Calcular";
                }

                const shippingEstimate = selectedSla.shippingEstimate;

                // Formata o texto da estimativa de entrega
                return this.formatShippingEstimateText(shippingEstimate);

            } catch (error) {
                utils.log("[CheckoutCustom] Erro ao obter estimativa de entrega:", error);
                return "A Calcular";
            }
        },

        /**
         * Converte a string de estimativa de entrega VTEX para objeto Date
         * @param {string} shippingEstimate - String no formato VTEX (ex: "3bd", "1d", "2w")
         * @returns {Date|null} Data de entrega ou null se não conseguir converter
         */
        parseShippingEstimate: function (shippingEstimate) {
            try {
                if (!shippingEstimate || typeof shippingEstimate !== 'string') {
                    return null;
                }

                const now = new Date();
                let deliveryDate = new Date(now);

                // Remove caracteres não numéricos e converte para número
                const numericValue = parseInt(shippingEstimate.replace(/[^\d]/g, ''));
                const unit = shippingEstimate.replace(/[\d]/g, '').toLowerCase();

                if (isNaN(numericValue)) {
                    return null;
                }

                switch (unit) {
                    case 'bd': // business days
                    case 'd':  // days
                        deliveryDate.setDate(deliveryDate.getDate() + numericValue);
                        break;
                    case 'w':  // weeks
                        deliveryDate.setDate(deliveryDate.getDate() + (numericValue * 7));
                        break;
                    case 'm':  // months
                        deliveryDate.setMonth(deliveryDate.getMonth() + numericValue);
                        break;
                    default:
                        // Assume days se não conseguir identificar a unidade
                        deliveryDate.setDate(deliveryDate.getDate() + numericValue);
                        break;
                }

                return deliveryDate;
            } catch (error) {
                utils.log("[CheckoutCustom] Erro ao converter estimativa de entrega:", error);
                return null;
            }
        },

        /**
         * Formata o texto da estimativa de entrega no estilo VTEX
         * @param {string} shippingEstimate - String no formato VTEX (ex: "3bd", "1d", "2w")
         * @returns {string} Texto formatado com pluralização
         */
        formatShippingEstimateText: function (shippingEstimate) {
            try {
                if (!shippingEstimate || typeof shippingEstimate !== 'string') {
                    return "A Calcular";
                }

                // Verifica se é um formato especial
                if (shippingEstimate.includes('-')) {
                    // Pode ser um formato especial como "scheduled" ou outro
                    return this.formatSpecialShippingEstimate(shippingEstimate);
                }

                // Remove caracteres não numéricos e converte para número
                const numericValue = parseInt(shippingEstimate.replace(/[^\d]/g, ''));
                const unit = shippingEstimate.replace(/[\d]/g, '').toLowerCase();

                if (isNaN(numericValue)) {
                    return "A Calcular";
                }

                // Formata baseado na unidade e valor
                switch (unit) {
                    case 'bd': // business days - dias úteis
                        return this.formatPluralText(numericValue, 'dia útil', 'Em até');

                    case 'd':  // days - dias corridos
                        return this.formatPluralText(numericValue, 'dia', 'Em até');

                    case 'w':  // weeks - semanas
                        return this.formatPluralText(numericValue, 'semana', 'Em até');

                    case 'm':  // months - meses
                        return this.formatPluralText(numericValue, 'mês', 'Em até');

                    case 'h':  // hours - horas
                        return this.formatPluralText(numericValue, 'hora', 'Em até');

                    case 'min': // minutes - minutos
                        return this.formatPluralText(numericValue, 'minuto', 'Em até');

                    default:
                        // Assume dias se não conseguir identificar a unidade
                        return this.formatPluralText(numericValue, 'dia', 'Em até');
                }

            } catch (error) {
                utils.log("[CheckoutCustom] Erro ao formatar texto da estimativa de entrega:", error);
                return "A Calcular";
            }
        },

        /**
         * Formata texto com pluralização correta
         * @param {number} value - Valor numérico
         * @param {string} unit - Unidade (ex: "dia", "hora")
         * @param {string} prefix - Prefixo do texto (ex: "Em até")
         * @returns {string} Texto formatado com pluralização
         */
        formatPluralText: function (value, unit, prefix = "Em até") {
            try {
                if (value === 0) {
                    // Casos especiais para valor 0
                    if (unit === 'dia útil') {
                        return "No mesmo dia";
                    } else if (unit === 'dia') {
                        return "No mesmo dia";
                    } else if (unit === 'hora' || unit === 'minuto') {
                        return "Em alguns instantes";
                    }
                    return `No mesmo ${unit}`;
                }

                let unitText = unit;
                if (value === 1) {
                    // Singular
                    // Mantém a unidade como está
                } else {
                    // Plural - adiciona "s" ou usa forma plural específica
                    if (unit === 'dia útil') {
                        unitText = 'dias úteis';
                    } else if (unit === 'mês') {
                        unitText = 'meses';
                    } else {
                        unitText = unit + 's';
                    }
                }

                return `${prefix} ${value} ${unitText}`;
            } catch (error) {
                utils.log("[CheckoutCustom] Erro ao formatar texto plural:", error);
                return "A Calcular";
            }
        },

        /**
         * Formata estimativas especiais de entrega (scheduled, etc.)
         * @param {string} shippingEstimate - Estimativa especial
         * @returns {string} Texto formatado
         */
        formatSpecialShippingEstimate: function (shippingEstimate) {
            try {
                // Implementação básica para formatos especiais
                // Pode ser expandido conforme necessário
                if (shippingEstimate.toLowerCase().includes('scheduled')) {
                    return "Agendada";
                }

                // Fallback para outros formatos
                return "A Calcular";
            } catch (error) {
                utils.log("[CheckoutCustom] Erro ao formatar estimativa especial:", error);
                return "A Calcular";
            }
        },

        /**
         * Formata uma data para o formato brasileiro DD/MM/YYYY (mantido para compatibilidade)
         * @param {Date} date - Data a ser formatada
         * @returns {string} Data formatada
         */
        formatDeliveryDate: function (date) {
            try {
                if (!(date instanceof Date) || isNaN(date.getTime())) {
                    return "A Calcular";
                }

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();

                return `${day}/${month}/${year}`;
            } catch (error) {
                utils.log("[CheckoutCustom] Erro ao formatar data de entrega:", error);
                return "A Calcular";
            }
        },

        destroy: function () {
            utils.log("Destruindo CheckoutCustom...");

            // Remove plugins
            state.plugins.forEach((plugin, name) => {
                pluginManager.unregister(name);
            });

            // Limpa estado
            state.isInitialized = false;
            state.currentPage = "";
            state.orderForm = null;

            utils.log("CheckoutCustom destruído");
        },
    };

    // Função para carregar plugins externos
    function loadCustomPlugins() {
        // Plugin de exemplo: CartCustomPlugin
        if (typeof CartCustomPlugin !== "undefined") {
            try {
                checkoutCustom.registerPlugin("cartCustom", CartCustomPlugin);
                console.log("✅ [CartCustomPlugin] carregado automaticamente");
            } catch (error) {
                console.error("❌ Erro ao carregar CartCustomPlugin:", error);
            }
        } else {
            console.warn(
                "⚠️ CartCustomPlugin não encontrado. Carregue o arquivo cart-custom-plugin.js"
            );
        }
    }

    // Inicialização automática quando DOM estiver pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            // Inicializa o CheckoutCustom
            api.init();

            // Carrega plugins customizados
            setTimeout(loadCustomPlugins, 200);
        });
    } else {
        // DOM já carregado
        setTimeout(() => {
            api.init();
            setTimeout(loadCustomPlugins, 200);
        }, 100);
    }

    // O accordion adiciona automaticamente a classe "accordion-controlled"
    // ao elemento alvo, que ativa overflow: hidden apenas quando necessário

    // Retorna apenas a API pública
    return api;
})();

// Alias global para compatibilidade
window.checkoutCustom = CheckoutCustom;