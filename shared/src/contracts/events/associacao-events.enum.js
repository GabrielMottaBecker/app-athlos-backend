"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociacaoRoutingKey = exports.AssociacaoExchangeName = void 0;
var AssociacaoExchangeName;
(function (AssociacaoExchangeName) {
    AssociacaoExchangeName["ASSOCIADO_CREATED"] = "associacao.associados.created.exchange";
    AssociacaoExchangeName["ASSOCIADO_UPDATED"] = "associacao.associados.updated.exchange";
    AssociacaoExchangeName["ASSOCIADO_DELETED"] = "associacao.associados.deleted.exchange";
    AssociacaoExchangeName["ASSOCIADO_STATUS_CHANGED"] = "associacao.associados.status-changed.exchange";
})(AssociacaoExchangeName || (exports.AssociacaoExchangeName = AssociacaoExchangeName = {}));
var AssociacaoRoutingKey;
(function (AssociacaoRoutingKey) {
    AssociacaoRoutingKey["ASSOCIADO_CREATED"] = "associado.created";
    AssociacaoRoutingKey["ASSOCIADO_UPDATED"] = "associado.updated";
    AssociacaoRoutingKey["ASSOCIADO_DELETED"] = "associado.deleted";
    AssociacaoRoutingKey["ASSOCIADO_STATUS_CHANGED"] = "associado.status-changed";
})(AssociacaoRoutingKey || (exports.AssociacaoRoutingKey = AssociacaoRoutingKey = {}));
//# sourceMappingURL=associacao-events.enum.js.map