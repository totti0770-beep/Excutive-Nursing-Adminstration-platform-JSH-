"""Custom Flask CLI commands."""

import getpass
import os

import click

from app.extensions import db
from app.models import User
from app.security import Roles


def register_commands(app):
    @app.cli.command("create-admin")
    @click.option("--email", default=None, help="Admin email (or set ADMIN_EMAIL).")
    @click.option(
        "--password",
        default=None,
        help="Admin password (or set ADMIN_PASSWORD). Prompted if omitted.",
    )
    def create_admin(email, password):
        """Create (or update) a System Admin user with a hashed password.

        No credentials are hard-coded: values come from options, environment
        variables (ADMIN_EMAIL / ADMIN_PASSWORD), or an interactive prompt.
        """
        email = email or os.environ.get("ADMIN_EMAIL")
        if not email:
            email = click.prompt("Admin email")
        email = email.strip().lower()

        # Fail fast if the address would be rejected by the login form's
        # validator (e.g. reserved domains like *.local), otherwise the
        # account could be created but never able to sign in.
        from email_validator import EmailNotValidError, validate_email

        try:
            email = validate_email(email, check_deliverability=False).normalized.lower()
        except EmailNotValidError as exc:
            raise click.ClickException(f"Invalid email: {exc}") from exc

        password = password or os.environ.get("ADMIN_PASSWORD")
        if not password:
            password = getpass.getpass("Admin password: ")
            confirm = getpass.getpass("Confirm password: ")
            if password != confirm:
                raise click.ClickException("Passwords do not match.")
        if len(password) < 8:
            raise click.ClickException("Password must be at least 8 characters.")

        user = User.query.filter_by(email=email).first()
        if user is None:
            user = User(email=email, role=Roles.SYSTEM_ADMIN)
            db.session.add(user)
            action = "Created"
        else:
            user.role = Roles.SYSTEM_ADMIN
            action = "Updated"
        user.set_password(password)
        db.session.commit()
        click.echo(f"{action} System Admin: {email}")
