from api.tools.toolsCategories import sales_by_category_tool, top_categories, least_margin_categories
from api.tools.toolsChannel import sales_by_channel_tool, best_channel, top_margin_channel
from api.tools.toolsMonth import monthly_sales_evolution, best_month, worst_month, predict_next_month_sales, compare_months
from api.tools.toolsProducts import top_selling_products, least_selling_products, top_billing_products, top_margin_products, least_margin_products, products_by_potential, product_detail
from api.tools.toolsSummary import summary_sales, average_ticket, health_margin

ALL_TOOLS = [
    sales_by_category_tool, 
    top_categories, 
    least_margin_categories,
    sales_by_channel_tool, 
    best_channel, 
    top_margin_channel,
    monthly_sales_evolution, 
    best_month, 
    worst_month, 
    predict_next_month_sales, 
    compare_months,
    top_selling_products, 
    least_selling_products, 
    top_billing_products, 
    top_margin_products, 
    least_margin_products, 
    products_by_potential, 
    product_detail,
    summary_sales, 
    average_ticket, 
    health_margin
]
