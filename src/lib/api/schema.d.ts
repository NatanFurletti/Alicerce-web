/**
 * ARQUIVO GERADO por `npm run generate:api`. Não edite à mão.
 * Fonte: http://localhost:3000/docs-json
 */

export interface paths {
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cadastra um usuário
         * @description Rate limit de 5/min por IP. A senha nunca é devolvida nem logada.
         */
        post: operations["AuthController_register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Autentica e devolve os tokens
         * @description Access token de 15 minutos e refresh de 7 dias. Senha errada e e-mail inexistente produzem a MESMA resposta, para não permitir enumerar a base.
         */
        post: operations["AuthController_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Renova o par de tokens
         * @description Aceita SOMENTE refresh token — um access token aqui devolve 401. Não há revogação: os tokens são stateless (ADR-006), e por isso não existe logout.
         */
        post: operations["AuthController_refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Perfil do usuário autenticado */
        get: operations["AuthController_me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/simulations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lista as simulações do usuário
         * @description Paginada, mais recentes primeiro. Item enxuto: sem CET nem totais.
         */
        get: operations["SimulationsController_list"];
        put?: never;
        /**
         * Cria e calcula uma simulação
         * @description Valida elegibilidade (LTV, renda, prazo), persiste e devolve o resumo com CET. A tabela de amortização NÃO é persistida — é recalculada sob demanda (ADR-003) e tem endpoint próprio.
         */
        post: operations["SimulationsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/simulations/compare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Compara SAC e Price
         * @description Mesmos parâmetros, os dois sistemas lado a lado. Não persiste nada. O SAC começa com parcela maior e cobra menos juros no total.
         */
        post: operations["SimulationsController_compare"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/simulations/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cálculo público, sem autenticação
         * @description Não persiste e não exige token. Rate limit de 10/min por IP.
         */
        post: operations["SimulationsController_preview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/simulations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Resumo da simulação */
        get: operations["SimulationsController_findOne"];
        put?: never;
        post?: never;
        /** Remove a simulação */
        delete: operations["SimulationsController_remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/simulations/{id}/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Resumo (rota explícita do SPEC) */
        get: operations["SimulationsController_summary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/simulations/{id}/schedule": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tabela de amortização paginada
         * @description Recalculada a cada leitura (ADR-003). `total` é o número de meses do contrato.
         */
        get: operations["SimulationsController_schedule"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/simulations/{id}/extra-payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registra aporte extraordinário
         * @description Devolve juros economizados, encargos economizados e meses eliminados. Validado ANTES de persistir: aporte inválido não deixa rastro no banco.
         */
        post: operations["SimulationsController_createExtraPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Liveness probe
         * @description Deliberadamente NÃO verifica o banco: um healthcheck que falha quando o Postgres cai faria o orquestrador reiniciar uma aplicação saudável.
         */
        get: operations["HealthController_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        RegisterDto: {
            /**
             * @description Nome do usuário.
             * @example Natan Furletti
             */
            name: string;
            /**
             * @description E-mail. Normalizado para minúsculas; precisa ser único.
             * @example natan@example.com
             */
            email: string;
            /**
             * @description Senha. Mínimo de 8 caracteres; o máximo é o limite do bcrypt (72 bytes), acima do qual ele truncaria em silêncio.
             * @example senha-valida-123
             */
            password: string;
        };
        UserResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example Natan Furletti */
            name: string;
            /** @example natan@example.com */
            email: string;
            /** Format: date-time */
            createdAt: string;
        };
        ErrorResponseDto: {
            /** @example 422 */
            statusCode: number;
            /**
             * @description Código estável, para o cliente tratar. A mensagem pode mudar; ele não.
             * @example LTV_EXCEEDED
             */
            code: string;
            /** @example LTV de 98.00% excede o máximo de 80%. Aumente o valor da entrada. */
            message: string;
            /** @example /simulations */
            path: string;
            /** Format: date-time */
            timestamp: string;
            /** @description Em erros de validação (400), a lista completa de campos inválidos. */
            details?: string[];
        };
        LoginDto: {
            /** @example natan@example.com */
            email: string;
            /** @example senha-valida-123 */
            password: string;
        };
        AuthUserResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example Natan Furletti */
            name: string;
            /** @example natan@example.com */
            email: string;
        };
        LoginResponseDto: {
            /** @description JWT de acesso. Vale 15 minutos. */
            accessToken: string;
            /** @description JWT de renovação, aceito só em /auth/refresh. Vale 7 dias. */
            refreshToken: string;
            user: components["schemas"]["AuthUserResponseDto"];
        };
        RefreshDto: {
            /**
             * @description O refreshToken devolvido no login. Um access token aqui dá 401.
             * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
             */
            refreshToken: string;
        };
        TokenPairResponseDto: {
            /** @description JWT de acesso. Vale 15 minutos. */
            accessToken: string;
            /** @description JWT de renovação, aceito só em /auth/refresh. Vale 7 dias. */
            refreshToken: string;
        };
        ChargesDto: {
            /**
             * @description Alíquota MENSAL do MIP (morte e invalidez), incidente sobre o saldo devedor de abertura do mês. Valor de referência, não regulação vigente.
             * @example 0.00025
             */
            mipMonthlyRate: number;
            /**
             * @description Alíquota MENSAL do DFI (danos físicos ao imóvel), incidente sobre o valor do imóvel — portanto constante ao longo do contrato.
             * @example 0.00005
             */
            dfiMonthlyRate: number;
            /**
             * @description Taxa de administração mensal fixa, em centavos. 2500 = R$ 25,00.
             * @example 2500
             */
            adminFeeCents: number;
        };
        CreateSimulationDto: {
            /**
             * @description Valor do imóvel em CENTAVOS. 50000000 = R$ 500.000,00.
             * @example 50000000
             */
            propertyValueCents: number;
            /**
             * @description Entrada em CENTAVOS. O financiado é a diferença; o LTV resultante precisa respeitar o limite da política (default 80%), sob pena de 422 LTV_EXCEEDED.
             * @example 10000000
             */
            downPaymentCents: number;
            /**
             * @description Prazo em meses.
             * @example 360
             */
            termMonths: number;
            /**
             * @description Taxa contratada ao ano, em decimal. 0.0975 = 9,75% a.a.
             * @example 0.0975
             */
            annualRate: number;
            /**
             * @description EFFECTIVE usa (1+i)^(1/12)-1; NOMINAL usa i/12. A nominal resulta em taxa mensal MAIOR: 12% a.a. nominal capitalizam em 12,68% a.a. efetivos.
             * @example EFFECTIVE
             * @enum {string}
             */
            rateConvention: "EFFECTIVE" | "NOMINAL";
            /**
             * @description SAC: amortização constante, parcela decrescente. PRICE: parcela fixa, amortização crescente — cobra mais juros no total.
             * @example SAC
             * @enum {string}
             */
            amortizationSystem: "SAC" | "PRICE";
            /**
             * @description Renda bruta familiar mensal em CENTAVOS. Se informada, a primeira parcela (com encargos) não pode exceder o percentual da política — default 30%.
             * @example 2000000
             */
            monthlyIncomeCents?: number;
            /** @description Encargos mensais da parcela. */
            charges: components["schemas"]["ChargesDto"];
        };
        ScheduleTotalsDto: {
            /** @description Juros pagos no contrato, em centavos. */
            totalInterest: number;
            /** @description Principal amortizado: igual ao valor financiado. */
            totalAmortization: number;
            totalMip: number;
            totalDfi: number;
            totalAdminFee: number;
            /** @description Desembolso total: amortização, juros e encargos. */
            totalPaid: number;
            /** @description Número de parcelas da tabela. */
            months: number;
        };
        CetResultDto: {
            /**
             * @description CET mensal, em decimal.
             * @example 0.0082
             */
            monthlyRate: number;
            /**
             * @description CET anual, em decimal: (1 + mensal)^12 - 1.
             * @example 0.1031
             */
            annualRate: number;
        };
        SimulationResponseDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            userId: string;
            /** @example 40000000 */
            financedAmountCents: number;
            /** @example 360 */
            termMonths: number;
            /** @description Taxa mensal já convertida, em decimal. */
            monthlyRate: number;
            /** @description Fração financiada do imóvel, em decimal: 0.8 = 80%. */
            ltv: number;
            /** @description Desembolso do 1º mês, com encargos, em centavos. */
            firstInstallmentCents: number;
            /** @description Desembolso do último mês, com encargos, em centavos. */
            lastInstallmentCents: number;
            summary: components["schemas"]["ScheduleTotalsDto"];
            cet: components["schemas"]["CetResultDto"];
            /** Format: date-time */
            createdAt: string;
            /** @description Parâmetros informados na criação, no formato do corpo de POST /simulations. */
            input: components["schemas"]["CreateSimulationDto"];
        };
        SimulationListItemDto: {
            /** Format: uuid */
            id: string;
            propertyValueCents: number;
            financedAmountCents: number;
            termMonths: number;
            /** @description Taxa anual em decimal. */
            annualRate: number;
            /** @enum {string} */
            amortizationSystem: "SAC" | "PRICE";
            /** Format: date-time */
            createdAt: string;
        };
        SimulationPageDto: {
            items: components["schemas"]["SimulationListItemDto"][];
            /** @description Total de itens em todas as páginas. */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            pageSize: number;
        };
        SystemComparisonDto: {
            /** @enum {string} */
            system: "SAC" | "PRICE";
            firstInstallmentCents: number;
            lastInstallmentCents: number;
            summary: components["schemas"]["ScheduleTotalsDto"];
            cet: components["schemas"]["CetResultDto"];
        };
        CompareResponseDto: {
            /** @example 40000000 */
            financedAmountCents: number;
            /** @example 360 */
            termMonths: number;
            sac: components["schemas"]["SystemComparisonDto"];
            price: components["schemas"]["SystemComparisonDto"];
            /** @description Quanto o Price cobra a mais de juros, em centavos. */
            interestDifferenceCents: number;
        };
        ScheduleEntryDto: {
            /** @description Número do mês, começando em 1. */
            month: number;
            /** @description Saldo devedor no início do mês. */
            openingBalance: number;
            interest: number;
            amortization: number;
            /** @description Aporte extraordinário aplicado no mês, ou zero. */
            extraPayment: number;
            mip: number;
            dfi: number;
            adminFee: number;
            /** @description Prestação sem encargos: juros + amortização. */
            installment: number;
            /** @description Desembolso do mês: prestação, encargos e aporte. */
            totalPayment: number;
            /** @description Saldo devedor ao final do mês. */
            closingBalance: number;
        };
        SchedulePageDto: {
            items: components["schemas"]["ScheduleEntryDto"][];
            /** @description Número de meses do contrato. */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            pageSize: number;
        };
        AddExtraPaymentDto: {
            /**
             * @description Mês do aporte, começando em 1. Precisa estar dentro do prazo.
             * @example 13
             */
            monthNumber: number;
            /**
             * @description Valor do aporte em CENTAVOS. Não pode exceder o saldo devedor do mês.
             * @example 5000000
             */
            amountCents: number;
            /**
             * @description REDUCE_TERM mantém a parcela e encurta o prazo — economiza MAIS juros. REDUCE_INSTALLMENT mantém o prazo e reduz a parcela.
             * @example REDUCE_TERM
             * @enum {string}
             */
            strategy: "REDUCE_TERM" | "REDUCE_INSTALLMENT";
        };
        ExtraPaymentSummaryDto: {
            totalInterestWithoutExtra: number;
            totalInterestWithExtra: number;
            /** @description Juros economizados pelos aportes, em centavos. */
            interestSaved: number;
            /** @description Encargos economizados pelos meses eliminados. */
            chargesSaved: number;
            /** @description Meses eliminados. Zero em REDUCE_INSTALLMENT. */
            monthsSaved: number;
            totalExtraPaid: number;
        };
        ExtraPaymentResponseDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            simulationId: string;
            summary: components["schemas"]["ExtraPaymentSummaryDto"];
            /** @description Prazo do contrato depois dos aportes. */
            newTermMonths: number;
        };
        HealthResponse: {
            /** @enum {string} */
            status: "ok";
            uptimeSeconds: number;
            /** Format: date-time */
            timestamp: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    AuthController_register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterDto"];
            };
        };
        responses: {
            /** @description Usuário criado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description VALIDATION_ERROR — entrada malformada. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description EMAIL_ALREADY_IN_USE — e-mail já cadastrado. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description RATE_LIMIT_EXCEEDED. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            /** @description Autenticado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponseDto"];
                };
            };
            /** @description INVALID_CREDENTIALS. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description RATE_LIMIT_EXCEEDED. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshDto"];
            };
        };
        responses: {
            /** @description Novo par emitido. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TokenPairResponseDto"];
                };
            };
            /** @description INVALID_TOKEN — inválido, expirado ou tipo errado. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    AuthController_me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Perfil. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description UNAUTHORIZED. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SimulationsController_list: {
        parameters: {
            query?: {
                /** @description Página, começando em 1. */
                page?: number;
                /** @description Itens por página. Teto de 100, contra exaustão de memória. */
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de simulações. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimulationPageDto"];
                };
            };
            /** @description UNAUTHORIZED. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SimulationsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSimulationDto"];
            };
        };
        responses: {
            /** @description Criada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimulationResponseDto"];
                };
            };
            /** @description VALIDATION_ERROR — entrada malformada. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description UNAUTHORIZED. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description Regra de negócio violada — ver `code`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SimulationsController_compare: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSimulationDto"];
            };
        };
        responses: {
            /** @description Comparação. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompareResponseDto"];
                };
            };
            /** @description Regra de negócio violada — ver `code`. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SimulationsController_preview: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSimulationDto"];
            };
        };
        responses: {
            /** @description Comparação calculada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompareResponseDto"];
                };
            };
            /** @description RATE_LIMIT_EXCEEDED. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SimulationsController_findOne: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Id da simulação. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Resumo com totais, CET e parâmetros informados. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimulationResponseDto"];
                };
            };
            /** @description UNAUTHORIZED. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description SIMULATION_NOT_FOUND — inexistente OU de outro usuário (ADR-015). */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SimulationsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Id da simulação. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Removida. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SIMULATION_NOT_FOUND — inexistente OU de outro usuário (ADR-015). */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SimulationsController_summary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Id da simulação. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Resumo. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SimulationResponseDto"];
                };
            };
            /** @description SIMULATION_NOT_FOUND — inexistente OU de outro usuário (ADR-015). */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SimulationsController_schedule: {
        parameters: {
            query?: {
                /** @description Página, começando em 1. */
                page?: number;
                /** @description Itens por página. Teto de 100, contra exaustão de memória. */
                pageSize?: number;
            };
            header?: never;
            path: {
                /** @description Id da simulação. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página da tabela. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SchedulePageDto"];
                };
            };
            /** @description SIMULATION_NOT_FOUND — inexistente OU de outro usuário (ADR-015). */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    SimulationsController_createExtraPayment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Id da simulação. */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddExtraPaymentDto"];
            };
        };
        responses: {
            /** @description Aporte registrado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ExtraPaymentResponseDto"];
                };
            };
            /** @description SIMULATION_NOT_FOUND — inexistente OU de outro usuário (ADR-015). */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
            /** @description EXTRA_PAYMENT_OUT_OF_RANGE ou EXTRA_PAYMENT_EXCEEDS_BALANCE. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponseDto"];
                };
            };
        };
    };
    HealthController_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Processo de pé. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
}
