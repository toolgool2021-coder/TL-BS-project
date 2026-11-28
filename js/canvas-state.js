// Track saves across renderers, including helpers called from the arena renderer.
function trackCanvasState(context) {
    const save = context.save.bind(context);
    const restore = context.restore.bind(context);
    let depth = 0;
    let extraRestores = 0;

    context.save = () => {
        save();
        depth++;
    };
    context.restore = () => {
        if (depth === 0) {
            extraRestores++;
            return;
        }
        restore();
        depth--;
    };

    return {
        finishFrame() {
            const unclosed = depth;
            while (depth > 0) context.restore();

            const transform = context.getTransform();
            const balanced = unclosed === 0 && extraRestores === 0;
            if (!balanced || !transform.isIdentity) {
                console.error('[TL BS] Canvas state imbalance', {unclosed, extraRestores, transform});
            }
            extraRestores = 0;
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.globalAlpha = 1;
            context.shadowBlur = 0;
            return balanced && transform.isIdentity;
        }
    };
}
