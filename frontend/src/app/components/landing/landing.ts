import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class LandingComponent {
  features = [
    {
      icon: 'fa-wallet',
      title: 'Budget Tracking',
      description: 'Set monthly budgets and track spending across categories in real time.'
    },
    {
      icon: 'fa-arrow-right-arrow-left',
      title: 'Transaction Management',
      description: 'Record income and expenses, categorize transactions, and stay organized.'
    },
    {
      icon: 'fa-chart-line',
      title: 'Investment Portfolio',
      description: 'Track your investments, monitor market prices, and see portfolio growth.'
    },
    {
      icon: 'fa-building-columns',
      title: 'Multi-Account Support',
      description: 'Manage multiple bank accounts and view consolidated balances.'
    },
    {
      icon: 'fa-shield-halved',
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with industry-standard security.'
    },
    {
      icon: 'fa-chart-pie',
      title: 'Smart Dashboard',
      description: 'Get a clear overview of your finances with visual insights and summaries.'
    }
  ];
}
