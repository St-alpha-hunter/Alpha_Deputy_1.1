from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="strategy/templates")


def render_factor_executor(factors):
    return templates.get_template("factor_executor.jinja").render(
        factors=factors,
    )


def render_strategy_selector(factors, stock_selection):
    return templates.get_template("strategy_selector.jinja").render(
        factors=factors,
        stock_selection=stock_selection,
    )

def render_strategy_executor(constraint):
    return templates.get_template("strategy_executor.jinja").render(
        constraint=constraint,
    )
