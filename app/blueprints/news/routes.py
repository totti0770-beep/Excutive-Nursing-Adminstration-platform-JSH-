"""News / Announcements routes.

The feed and detail views are visible to any authenticated user; creating,
editing and deleting are restricted to administrators / directors.
"""

from flask import flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from app.blueprints.news import CATEGORIES, news_bp
from app.blueprints.news.forms import AnnouncementForm
from app.extensions import db
from app.models import Announcement
from app.security import Roles, role_required

PER_PAGE = 8
_MANAGE_ROLES = (Roles.SYSTEM_ADMIN, Roles.NURSING_DIRECTOR)


def _can_manage():
    return current_user.is_authenticated and current_user.role in _MANAGE_ROLES


@news_bp.route("/")
@login_required
def feed():
    category = request.args.get("category", "", type=str).strip()
    page = request.args.get("page", 1, type=int)

    query = Announcement.query.filter(Announcement.is_published.is_(True))
    if category in CATEGORIES:
        query = query.filter(Announcement.category == category)

    pagination = query.order_by(
        Announcement.pinned.desc(), Announcement.created_at.desc()
    ).paginate(page=page, per_page=PER_PAGE, error_out=False)

    return render_template(
        "news/list.html",
        pagination=pagination,
        items=pagination.items,
        categories=CATEGORIES,
        filters={"category": category},
        can_manage=_can_manage(),
    )


@news_bp.route("/<int:ann_id>")
@login_required
def detail(ann_id):
    ann = db.get_or_404(Announcement, ann_id)
    # Non-managers can only view published items.
    if not ann.is_published and not _can_manage():
        from flask import abort

        abort(404)
    return render_template(
        "news/detail.html", ann=ann, categories=CATEGORIES, can_manage=_can_manage()
    )


@news_bp.route("/new", methods=["GET", "POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def new_announcement():
    form = AnnouncementForm()
    if form.validate_on_submit():
        ann = Announcement(
            title=form.title.data.strip(),
            category=form.category.data,
            body=form.body.data.strip(),
            is_published=form.is_published.data,
            pinned=form.pinned.data,
            created_by=current_user.display_name,
        )
        db.session.add(ann)
        db.session.commit()
        flash("تم نشر المنشور بنجاح", "success")
        return redirect(url_for("news.feed"))
    return render_template("news/form.html", form=form, mode="new")


@news_bp.route("/<int:ann_id>/edit", methods=["GET", "POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def edit_announcement(ann_id):
    ann = db.get_or_404(Announcement, ann_id)
    form = AnnouncementForm(obj=ann)
    if form.validate_on_submit():
        ann.title = form.title.data.strip()
        ann.category = form.category.data
        ann.body = form.body.data.strip()
        ann.is_published = form.is_published.data
        ann.pinned = form.pinned.data
        db.session.commit()
        flash("تم تحديث المنشور", "success")
        return redirect(url_for("news.detail", ann_id=ann.id))
    return render_template("news/form.html", form=form, mode="edit", ann=ann)


@news_bp.route("/<int:ann_id>/delete", methods=["POST"])
@login_required
@role_required(*_MANAGE_ROLES)
def delete_announcement(ann_id):
    ann = db.get_or_404(Announcement, ann_id)
    db.session.delete(ann)
    db.session.commit()
    flash("تم حذف المنشور", "success")
    return redirect(url_for("news.feed"))
